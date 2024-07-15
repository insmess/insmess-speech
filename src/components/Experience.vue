<script setup>

import ASRT from './SubMenu/ASR/ASRT.vue'
import TTST from './SubMenu/TTS/TTST.vue'
import VecCompare from './SubMenu/VEC/VecCompare.vue'

</script>

<template>
    <div className="experience">
      <div className="experience_wrapper">
        <div className="experience_title">
          功能体验
        </div>
        <div className="experience_describe">
          体验前，请允许浏览器获取麦克风权限
        </div>
        <div className="experience_content" >
          <el-tabs
            className="experience_tabs"
            type="border-card"
          >
            <el-tab-pane label="语音识别" key="10">
            <ASRT></ASRT>
            </el-tab-pane>
            <el-tab-pane label="声纹识别" key="11">
            <vec-compare></vec-compare>
            </el-tab-pane>
            <el-tab-pane label="语音合成" key="12">
            <TTST></TTST>
            </el-tab-pane>
            <el-tab-pane label="解析配置" key="20">
            <ASRT></ASRT>
            </el-tab-pane>
            <el-tab-pane label="敏感词字典" key="21">
            <ASRT></ASRT>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
</template>


<style lang="less">
@import "./style.less";

</style>