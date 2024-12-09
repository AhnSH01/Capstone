from flask import Flask, Response
import cv2

app = Flask(__name__)

# 웹캠 초기화
camera = cv2.VideoCapture(0)  # 노트북 기본 웹캠 (ID: 0)


def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # 프레임을 JPEG로 인코딩
            _, buffer = cv2.imencode(".jpg", frame)
            frame = buffer.tobytes()
            # MJPEG 스트림 형식으로 반환
            yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


@app.route("/stream")
def video_feed():
    # 클라이언트가 MJPEG 스트림을 받을 수 있도록 설정
    return Response(
        generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
