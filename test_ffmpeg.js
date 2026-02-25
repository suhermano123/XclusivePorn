import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

const url = "https://video-cf-h.xhcdn.com/%2FpHRMdccWLxG1vnpHUKWsAPPHh%2F%2FNW1l8DghMpkvxyc%3D/99/1771995600/media=hls4/multi=256x144:144p,426x240:240p,854x480:480p,1280x720:720p,1920x1080:1080p/024/106/485/1080p.h264.mp4.m3u8";

ffmpeg(url)
    .inputOptions([
        '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n'
    ])
    .outputOptions([
        '-c copy',
        '-bsf:a aac_adtstoasc',
        '-movflags frag_keyframe+empty_moov'
    ])
    .outputFormat('mp4')
    .on('start', (commandLine) => {
        console.log('Iniciando FFmpeg con el comando:', commandLine);
    })
    .on('stderr', function (stderrLine) {
        console.log('Stderr output: ' + stderrLine);
    })
    .on('error', (err) => {
        console.error('Error procesando el video con FFmpeg:', err.message);
    })
    .on('end', () => {
        console.log('Video procesado completamente y enviado al cliente.');
    })
    .save('test.mp4');
