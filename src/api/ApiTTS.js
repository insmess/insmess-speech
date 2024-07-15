import request from '@/utils/request'

// 上传音频文件，获得识别结果
export async function ttsOffline(data){
    return await request({
        url: '/tts/getFileBase64',
        method: 'post',
        data
    })
}