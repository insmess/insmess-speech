import request from '@/utils/request'

// 上传音频文件，获得识别结果
export async function vecCompare(data){
    return await request({
        url: '/vocieprint/compare',
        method: 'post',
        data   
    })
}
