<template>
  <div class="speech_recognition">
      <div class="speech_recognition_tabs">
        <div class="frame"></div>
        <div class="audioFileIdentification">
        <div v-if="uploadStatus === 0" class="public_recognition_speech">
            <!-- 上传前 -->
            <el-upload
                :multiple="true"
                :accept="'.wav'"
                :limit="2"
                :auto-upload="false"
                :on-change="handleChange"
                :show-file-list="true"
            >
              <el-button type="primary">上传文件</el-button>
            </el-upload>
            <el-button type="warning" @click="vectorCompare" class="yysbButton">声纹对比</el-button>
        </div>
        <!-- 上传中 -->
        <div v-else-if="uploadStatus === 1" class="on_the_cross_speech">
            <div class="on_the_upload_img">
                <div class="on_the_upload_img_back"></div>
            </div>
            <div class="on_the_speech_text">
                <span class="on_the_speech_loading"> <Spin indicator={antIcon} /></span> 上传中
            </div>
        </div>


      <!-- {/* 指向 */} -->
      <div class="public_recognition_point_to">

      </div>
      <!-- {/* 识别结果 */} -->
      <div class="public_recognition_result">
        <div>声纹对比结果</div>
        <div>{{ asrResult }}</div>
      </div>
    </div>
    </div>
  </div>  
</template>

<script>
import { vecCompare } from '../../../api/ApiVEC'

let audioCtx = new AudioContext({
  latencyHint: 'interactive',
  sampleRate: 24000,
});

export default {
    name:"",
    data(){
        return {
            uploadStatus : 0,
            recognitionStatus : 0,
            asrResult : "",
            indicator : "",
            
            filename: "",
            upfile: "",
            fileList: []

        }
    },

    methods:{
        // 上传文件切换
        handleChange(file, fileList){
            // this.uploadStatus = 2
            this.filename = file.name
            this.upfile = file
            this.fileList = fileList;
            console.log(this.fileList)
        },
        readFile(file) {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.onload = function () {
                    resolve(fileReader);
                };
                fileReader.onerror = function (err) {
                    reject(err);
                };
                fileReader.readAsDataURL(file);
                });
            },
        // 重新上传
        uploadAgain(){
            this.uploadStatus = 0
            this.upfile = ""
            this.filename = ""
            this.asrResult = ""
        },

        // 播放音频
        playAudioData(wav_buffer){
            audioCtx.decodeAudioData(wav_buffer, buffer => {
                let source = audioCtx.createBufferSource();
                source.buffer = buffer
            
                source.connect(audioCtx.destination);
                source.start();
            }, function (e) {
            });
        },

        // 播放本地音频
        async paly(){
            if(this.upfile){
                let fileRes = ""
                let fileString = ""
                fileRes = await this.readFile(this.upfile.raw);
                fileString = fileRes.result;
                const audioBase64type = (fileString.match(/data:[^;]*;base64,/))?.[0] ?? '';
                const isBase64 = !!fileString.match(/data:[^;]*;base64,/);
                const uploadBase64 = fileString.substr(audioBase64type.length);
                // isBase64 ? uploadBase64 : undefined
                // base转换二进制数
                let typedArray = this.base64ToUint8Array(isBase64 ? uploadBase64 : undefined)
                this.playAudioData(typedArray.buffer)
            }
        },
        base64ToUint8Array(base64String){
           const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/-/g, '+')
                .replace(/_/g, '/');
        
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
        
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray; 
        },

        // 开始对比
        async vectorCompare(){
          // 对比中
          if (this.fileList.length != 2) {
            this.$message.error('必须两个文件才能对比');
          }
          const formData = new FormData();
          formData.append('fileOne', this.fileList[0].raw);
          formData.append('fileTwo', this.fileList[1].raw);
          const result = await vecCompare(formData)
          // 重新识别
          console.log(result);
          // debugger
          if (result.data.code === 200) {

            this.$message.success("识别成功")
            // 获取识别文本
            this.asrResult = result.data.data
            
          } else {
            this.$message.success("识别失败")
          };
        },

        // 重新识别
        toIdentifyThe(){
          // this.uploadAgain()
          this.uploadStatus = 0
          this.recognitionStatus = 0
          this.asrResult = ""
        }

    }
}   

</script>

<style lang="less" scoped>
@import "./style.less";


</style>