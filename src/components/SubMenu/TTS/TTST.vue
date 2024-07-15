<template>
    <div class="speech_recognition">
      <!-- {/* 中文文本 */} -->
      <div class="recognition_text">
        <div class="recognition_text_header">
          <div class="recognition_text_title">
            中文文本
          </div>
          <div class="recognition_text_random" @click="getRandomChineseWord()">
            <span></span><span>更换示例</span>
          </div>
        </div>

        <div class="recognition_text_field">

            <el-input
            v-model="textarea"
            :autosize="{ minRows: 13, maxRows: 13 }"
            type="textarea"
            placeholder="Please input"
            />

            
        </div>
      </div>
      <!-- {/* 指向 */} -->
      <div class="recognition_point_to"></div>
      <!-- {/* 语音合成 */} -->
      <div class="speech_recognition_new">
        <div class="speech_recognition_title">
          语音合成
        </div>
            <!-- //  {/* 端到端合成 */} -->
            <div v-if="endToEndOnInit" class="speech_recognition_end_to_end"
              @click="EndToEndSynthesis()"
            >
              语音合成
            </div>
            <div v-else>
                <div  v-if="endToEndStopStatus"  class="end_to_end_ing_box">
                  <div class="end_to_end_ing">
                    <div class="end_to_end_ing_img"> </div>
                    <!-- <Spin indicator={antIcon}></Spin> -->
                    <div class="end_to_end_ing_text">合成中</div>

                  </div>
                  <div class="end_to_end_ing_time">响应时间：0s</div>
                </div>
                
                <div v-else class="end_to_end_suspended_box">
                    <div v-if="endToEndContinueStatus" class="end_to_end_suspended"
                        @onClick="EndToEndStop()"
                    >
                    <div class="end_to_end_suspended_img"></div>
                    <div class="end_to_end_suspended_text">暂停播放</div>

                    </div>
                    <div v-else class="end_to_end_continue"
                      @click="EndToEndResume()"
                    >
                      <div class="end_to_end_continue_img"></div>
                      <div class="end_to_end_continue_text">继续播放</div>
                    </div>
                    <div class="end_to_end_ing_suspended_time">响应时间：{{Number(endToEndAcceptStamp) - Number(endToEndSendStamp) }}ms</div>
                </div>
            </div>
                
      </div>
    </div>
</template>

<script>
import { ttsOffline } from '../../../api/ApiTTS.js'

// 全局承接流式 chunk 块
let chunks = []
let AudioContext = window.AudioContext || window.webkitAudioContext;
let chunk_index = 0
let palyIndex = 0
let reciveOver = false


// 定义新的流式播放服务
let _audioSrcNodes = []
const _audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
let _playStartedAt = 0
let _totalTimeScheduled = 0

function _reset(){
    _playStartedAt = 0
    _totalTimeScheduled = 0
    _audioSrcNodes = []
}



export default {
    name: "TTSTS",
    data () {
        return {
            textarea: "",
            audioCtx: '',
            source: '',
            typedArray: '',
            ttsResult: '',

            // 控制播放状态
            streamingContinueStatus: true,
            endToEndContinueStatus: true,
            // 控制初始状态
            streamingOnInit: true, 
            endToEndOnInit: true, 
            // 控制是否开始
            streamingStopStatus: false,
            endToEndStopStatus: false,

            // 流式接收时间戳
            streamingAcceptStamp: '0',
            endToEndAcceptStamp: '0',
            // 流式发起时间戳
            streamingSendStamp: '0',
            endToEndSendStamp: '0'
            
        }
    },
    mounted(){
        this.getRandomChineseWord()
        
       
    },

    methods: {
        // 状态变量重置
        resetStatus(){
            this.streamingContinueStatus = true
            this.streamingOnInit = true
            this.streamingStopStatus = false

            this.endToEndContinueStatus = true
            this.endToEndOnInit = true
            this.endToEndStopStatus = false
        },

        // 生成随机文本
        getRandomChineseWord(){
            const resultChina = [
                "钱伟长想到上海来办学校是经过深思熟虑的。",
                "林荒大吼出声，即便十年挣扎，他也从未感到过如此无助。自己的身体一点点陷入岁月之门，却眼睁睁的看着君倾城一手持剑，雪白的身影决然凄厉。就这样孤身一人，于漫天风雪中，对阵数千武者。",
                "我们将继续成长，用行动回击那些只会说风凉话，不愿意和我们相向而行的害群之马。",
                "许多道理，人们已经证明过千遍万遍，为什么还要带着侥幸的心理再去试验一回呢？",
                "宫内整洁利索，廊柱门窗颜色鲜艳，几名电工正在维修线路。",
                "他身材矮小，颧骨突出，留着小胡子，说话一口浓重的福建口音。",
                "阿杰让阿悦看下剩下的盒饭合不合他的胃口。",
                "有网友问，能不能回忆几件刘洋在学校里的趣事或糗事。"
                ];
            let text = "";

            text = resultChina[Math.floor(Math.random() * 7)];
            this.textarea = text
        },
       
        // 流式播放器
        _schedulePlaybackWav({wavData}) {
            var _that = this
            _audioCtx.decodeAudioData(wavData, audioBuffer => {
            const audioSrc = _audioCtx.createBufferSource()
            audioSrc.onended = () => {
                _audioSrcNodes.shift();
                if(_audioSrcNodes.length === 0){
                    _that.resetStatus()
                }
                };
            _audioSrcNodes.push(audioSrc);
            let startDelay = 0;
            if (!_playStartedAt) {
                startDelay = 10 / 1000;
                _playStartedAt = _audioCtx.currentTime + startDelay;
                }
            audioSrc.buffer = audioBuffer;
            audioSrc.connect(_audioCtx.destination);
            
            const startAt = _playStartedAt + _totalTimeScheduled;
            audioSrc.start(startAt);

            _totalTimeScheduled+= audioBuffer.duration;

            })    
        },

        // base64转换
        base64ToUint8Array(base64String) {
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
        
        // 暂停播放
        playerPaused(){
            _audioCtx.suspend()
        },

        // 恢复播放
        playerResume(){
            _audioCtx.resume()
        },

        // 流式播放暂停
        streamingStop(){
            this.playerPaused()
            // 切换为暂停状态
            this.streamingContinueStatus = false

        },
        // 流式播放恢复
        streamingResume(){
            this.playerResume()
            this.streamingContinueStatus = true
        },
        
        // 端到端合成
        async EndToEndSynthesis(){
            this.endToEndSendStamp = Date.now()
            this.endToEndOnInit = false
            this.endToEndStopStatus = true
            console.log({ text : this.textarea})
            let ttsResult = await ttsOffline({ text : this.textarea});
            console.log('ttsResult', ttsResult);
            if (ttsResult.data.code == 200) {
                this.endToEndAcceptStamp = Date.now()
                this.endToEndStopStatus = false
                this.endToEndContinueStatus = true
                // base转换二进制数
                let typedArray = this.base64ToUint8Array(ttsResult.data.data)
                // 播放音频
                this._schedulePlaybackWav({
                    wavData: typedArray.buffer,
                })                
            };
        },

        // 端到端播放暂停
        streamingStop(){
            this.playerPaused()
            // 切换为暂停状态
            this.endToEndContinueStatus = false

        },
        // 端到端播放恢复
        streamingResume(){
            this.playerResume()
            this.endToEndContinueStatus = true
        },




    }

}

</script>



<style lang="less" scoped>
@import "./style.less";
</style>