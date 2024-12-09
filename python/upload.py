from flask import Flask, jsonify
import ffmpeg
import os
from boto3.session import Session
import threading
import time
import datetime
import signal
import requests
import cv2
import numpy as np
from dotenv import load_dotenv

app = Flask(__name__)

# .env 파일의 환경 변수를 로드
load_dotenv()

# 환경 변수 사용
ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
bucket = os.getenv("AWS_BUCKET")

session = Session(aws_access_key_id=ACCESS_KEY_ID, aws_secret_access_key=SECRET_KEY)
s3 = session.resource("s3")

my_bucket = s3.Bucket(bucket)

# ESP32-CAM MJPEG 스트림 URL
STREAM_URL = os.getenv("ESP32_STREAM_URL")

# HLS 출력 디렉토리
HLS_OUTPUT_DIR = "hls_output"
os.makedirs(HLS_OUTPUT_DIR, exist_ok=True)

# 전역 변수로 프로세스 상태 관리
ffmpeg_process = None
upload_thread = None
is_streaming = False
stream_start_time = None

def create_segment(start_frame, end_frame, segment_number):
    try:
        image_files = []
        for i in range(start_frame, end_frame):
            frame_path = f"frame_{i:08d}.jpg"
            full_path = os.path.join(HLS_OUTPUT_DIR, frame_path)
            if os.path.exists(full_path):
                image_files.append(frame_path)
        
        if not image_files:
            return False

        # 각 이미지의 지속 시간을 동적으로 계산
        # 전체 10초를 이미지 개수로 나눔
        duration_per_frame = 10.0 / len(image_files)
        
        list_path = os.path.join(HLS_OUTPUT_DIR, f"list_{segment_number}.txt")
        with open(list_path, 'w') as f:
            for img in image_files:
                f.write(f"file '{img}'\n")
                f.write(f"duration {duration_per_frame}\n")
            # 마지막 프레임 추가
            f.write(f"file '{image_files[-1]}'\n")

        try:
            current_dir = os.getcwd()
            os.chdir(HLS_OUTPUT_DIR)
            
            ffmpeg_cmd = (
                ffmpeg
                .input(f"list_{segment_number}.txt", format='concat', safe=0)
                .output(
                    f"segment_{segment_number:03d}.ts",
                    vcodec='libx264',
                    preset='ultrafast',
                    f='mpegts',
                    video_track_timescale=90000,
                    g=10,
                    sc_threshold=0,
                    r=10
                )
                .overwrite_output()
            )
            
            stdout, stderr = ffmpeg_cmd.run(capture_stdout=True, capture_stderr=True, quiet=True)
            os.chdir(current_dir)
            
        except ffmpeg.Error as e:
            os.chdir(current_dir)
            raise
        
        try:
            os.remove(list_path)
        except Exception:
            pass
        
        for img in image_files:
            try:
                full_path = os.path.join(HLS_OUTPUT_DIR, img)
                os.remove(full_path)
            except Exception:
                pass
        
        return True
    except Exception:
        return False

def update_playlist(segment_count):
    try:
        playlist_path = os.path.join(HLS_OUTPUT_DIR, "stream.m3u8")
        
        # M3U8 플레이리스트 생성
        content = [
            "#EXTM3U",
            "#EXT-X-VERSION:3",
            "#EXT-X-TARGETDURATION:10",
            "#EXT-X-MEDIA-SEQUENCE:0",
            "#EXT-X-PLAYLIST-TYPE:EVENT"
        ]
        
        # 세그먼트 항목 추가
        for i in range(segment_count):
            content.extend([
                "#EXTINF:10.0,",
                f"segment_{i:03d}.ts"
            ])
        
        # 플레이리스트 파일 저장
        with open(playlist_path, 'w') as f:
            f.write('\n'.join(content))
            
        print(f"플레이리스트 업데이트 완료 (세그먼트 수: {segment_count})")
    except Exception as e:
        print(f"플레이리스트 업데이트 중 오류: {e}")

def process_mjpeg_stream():
    global is_streaming, stream_start_time
    frame_count = 0
    segment_count = 0
    frames_per_segment = 100  # 10fps × 10초 = 100프레임
    last_save_time = time.time()
    frame_interval = 1.0/10  # 0.1초 간격 (10fps)
    
    try:
        response = requests.get(STREAM_URL, stream=True)
        if response.status_code != 200:
            print("스트림 연결 실패")
            return

        bytes_buffer = bytes()
        for chunk in response.iter_content(chunk_size=16384):
            if not is_streaming:
                break
            
            bytes_buffer += chunk
            
            while True:
                start_idx = bytes_buffer.find(b'\xff\xd8')
                if start_idx == -1:
                    bytes_buffer = bytes_buffer[-2:]
                    break
                
                end_idx = bytes_buffer.find(b'\xff\xd9', start_idx)
                if end_idx == -1:
                    bytes_buffer = bytes_buffer[start_idx:]
                    break
                
                current_time = time.time()
                if current_time - last_save_time >= frame_interval:
                    try:
                        jpg_data = bytes_buffer[start_idx:end_idx + 2]
                        frame = cv2.imdecode(np.frombuffer(jpg_data, dtype=np.uint8), cv2.IMREAD_IGNORE_ORIENTATION | cv2.IMREAD_COLOR)
                        
                        if frame is not None:
                            frame_path = os.path.join(HLS_OUTPUT_DIR, f"frame_{frame_count:08d}.jpg")
                            cv2.imwrite(frame_path, frame)
                            frame_count += 1
                            last_save_time = current_time
                            
                            # 100프레임(10초)마다 세그먼트 생성
                            if frame_count % frames_per_segment == 0:
                                start_frame = frame_count - frames_per_segment
                                if create_segment(start_frame, frame_count, segment_count):
                                    segment_count += 1
                                    update_playlist(segment_count)
                    except Exception as e:
                        pass
                
                bytes_buffer = bytes_buffer[end_idx + 2:]
                if len(bytes_buffer) < 2:
                    break

    except Exception as e:
        print(f"스트림 처리 중 오류 발생: {e}")
        if is_streaming:
            time.sleep(1)
            process_mjpeg_stream()

def clear_hls_output():
    try:
        if os.path.exists(HLS_OUTPUT_DIR):
            for file in os.listdir(HLS_OUTPUT_DIR):
                try:
                    os.remove(os.path.join(HLS_OUTPUT_DIR, file))
                except Exception as e:
                    print(f"Error removing file {file}: {e}")
    except Exception as e:
        print(f"Error clearing output directory: {e}")

def periodic_upload():
    global is_streaming
    
    while is_streaming:
        try:
            current_files = os.listdir(HLS_OUTPUT_DIR)
            ts_count = len([f for f in current_files if f.endswith('.ts')])
            if ts_count > 0:
                print(f"현재 TS 파일 수: {ts_count}")

            # TS 파일 처리
            ts_files = sorted([f for f in current_files if f.endswith('.ts')])
            for ts_file in ts_files:
                if not is_streaming:
                    break
                file_path = os.path.join(HLS_OUTPUT_DIR, ts_file)
                try:
                    my_bucket.upload_file(file_path, f"{stream_start_time}/{ts_file}")
                    print(f"업로드 완료: {ts_file}")
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error uploading {ts_file}: {e}")
            
            # m3u8 파일 처리
            m3u8_file_path = os.path.join(HLS_OUTPUT_DIR, "stream.m3u8")
            if os.path.exists(m3u8_file_path):
                try:
                    my_bucket.upload_file(m3u8_file_path, f"{stream_start_time}/stream.m3u8")
                except Exception as e:
                    print(f"Error uploading stream.m3u8: {e}")
            
            time.sleep(1)
            
        except Exception as e:
            print(f"Upload error: {e}")
            time.sleep(1)

def log_stderr():
            progress_line = ""
            while is_streaming:
                char = ffmpeg_process.stderr.read(1)
                if not char:
                    break
                try:
                    char = char.decode()
                    if char == '\r' or char == '\n':
                        if "fps=" in progress_line:
                            print(f"\rFFmpeg 진행: {progress_line.strip()}", end='', flush=True)
                        elif progress_line.strip():
                            print(f"\nFFmpeg: {progress_line.strip()}")
                        progress_line = ""
                    else:
                        progress_line += char
                except Exception:
                    pass
                
@app.route("/start_hls", methods=["POST"])
def start_hls():
    global ffmpeg_process, is_streaming, stream_start_time
    try:
        if is_streaming:
            return jsonify({"message": "Streaming is already running"}), 400

        clear_hls_output()
        
        is_streaming = True
        stream_start_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        ffmpeg_cmd = (
            ffmpeg
            .input(
                STREAM_URL,
                f='image2pipe',
                vcodec='mjpeg',
                use_wallclock_as_timestamps='1',
                fflags='nobuffer'
            )
            .output(
                os.path.join(HLS_OUTPUT_DIR, "stream.m3u8"),
                vcodec='libx264',
                preset='ultrafast',
                tune='zerolatency',
                f='hls',
                hls_time=10,
                hls_list_size=0,
                hls_flags='append_list',
                hls_segment_filename=os.path.join(HLS_OUTPUT_DIR, "segment_%05d.ts"),
                hls_segment_type='mpegts',
                force_key_frames='expr:gte(t,n_forced*10)',
                g=100,
                sc_threshold=0,
                r=10
            )
            .overwrite_output()
        )

        ffmpeg_process = ffmpeg_cmd.run_async(pipe_stderr=True)

        stderr_thread = threading.Thread(target=log_stderr, daemon=True)
        stderr_thread.start()

        upload_thread = threading.Thread(target=periodic_upload, daemon=True)
        upload_thread.start()
        
        return jsonify({"message": "HLS streaming started"}), 200
    except Exception as e:
        is_streaming = False
        print(f"스트리밍 시작 중 오류 발생: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/stop_hls", methods=["POST"])
def stop_hls():
    global ffmpeg_process, is_streaming
    try:
        if not is_streaming:
            return jsonify({"message": "Streaming is not running"}), 400
        
        is_streaming = False
        
        if ffmpeg_process:
            # SIGTERM 대신 SIGKILL 사용하여 즉시 종료
            ffmpeg_process.kill()
            try:
                ffmpeg_process.stderr.close()  # stderr 파이프 닫기
            except:
                pass
            ffmpeg_process = None
            
        clear_hls_output()
        print("\n스트리밍 중지됨")
        return jsonify({"message": "HLS streaming stopped"}), 200
    except Exception as e:
        print(f"Error stopping stream: {e}")
        return jsonify({"error": str(e)}), 500

def cleanup(signum, frame):
    global is_streaming
    is_streaming = False
    if ffmpeg_process:
        ffmpeg_process.kill()
    print("Cleanup completed")
    exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    app.run(host="0.0.0.0", port=5000, debug=True)
