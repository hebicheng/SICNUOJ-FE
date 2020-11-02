<!--
 * @Descripttion:
 * @version:
 * @Author: hebicheng
 * @Date: 2020-11-01 10:29:17
 * @LastEditors: hebicheng
 * @LastEditTime: 2020-11-02 19:50:21
-->
<template>
  <Row type="flex" justify="space-around">
    <Col :span="22">
        <el-carousel :interval="5000" type="card" height="350px">
          <div v-if="contests.length" class="contest">
            <el-carousel-item v-for="(contest, index) of contests" :key="index" >       
              <div class="contest-content">
                <h2 style="position: absolute; top:40px; left: 20px; text-align:center">
                  <Button type="text"  class="contest-title" @click="goContest(index)">{{contests[index].title}}
                  </Button>
                  <Button size="small" shape="circle" :type="contest.status === '0' ? 'success' : 'warning'" >{{CONTEST_STATUS_REVERSE[contest.status].name}}
                  </Button>
                  <Button type="info" shape="circle" size="small" icon="calendar">
                    {{contest.start_time | localtime('YYYY-M-D HH:mm') }}
                  </Button>
                  <Button shape="circle" size="small" icon="android-time">
                    {{getDuration(contest.start_time, contest.end_time)}}
                  </Button>
                  <Button shape="circle" size="small" icon="trophy">
                    {{contest.rule_type}}
                  </Button>
                </h2> 
                <div class="contest-content-description">
                  <blockquote v-html="contest.description.slice(0, 400)"></blockquote>...
                </div>
              </div>
            </el-carousel-item> 
          </div>
          <el-carousel-item>
            <img src="/public/upload/home-banner-1.png" alt="">
          </el-carousel-item>
          <el-carousel-item v-if="getExtraImage('/public/upload/home-banner-2.png')">
            <img src="/public/upload/home-banner-2.png" alt="">
          </el-carousel-item>
          <el-carousel-item v-if="getExtraImage('/public/upload/home-banner-3.png')">
            <img src="/public/upload/home-banner-3.png" alt="">
          </el-carousel-item>
        </el-carousel>
      
    <Announcements class="announcement"></Announcements>
    </Col>
  </Row>
  
</template>

<script>
  import Announcements from './Announcements.vue'
  import api from '@oj/api'
  import time from '@/utils/time'
  import { CONTEST_STATUS, CONTEST_STATUS_REVERSE } from '@/utils/constants'
  import axios from 'axios'

  export default {
    name: 'home',
    components: {
      Announcements
    },
    data () {
      return {
        contests: [],
        index: 0,
        CONTEST_STATUS_REVERSE: CONTEST_STATUS_REVERSE
      }
    },
    mounted () {
      let params = { status: CONTEST_STATUS.NOT_ENDED }
      api.getContestList(0, 5, params).then((res) => {
        this.contests = res.data.data.results
      })
    },
  
    methods: {
      getDuration (startTime, endTime) {
        return time.duration(startTime, endTime)
      },
      goContest (index) {
        this.index = index
        this.$router.push({
          name: 'contest-details',
          params: { contestID: this.contests[this.index].id }
        })
      },
      getExtraImage (url) {
        axios
        .get(url)
        .then(response => {
          return true
        })
        .catch(error => {
          console.log(error ? 'no more images' : '')
          return false
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  @import url("https://unpkg.com/element-ui@2.3.7/lib/theme-chalk/index.css");
  .contest {
    &-title {
      font-style: italic;
      font-size: 21px;
    }
    &-content {
      padding: 0 50px 40px 50px;
      &-description {
        height: 250px;
      }
    }
  }

  .announcement {
    margin-top: 20px;
  }

  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 20px;
  }
  
  .el-carousel__item:nth-child(2n) {
    background-color: #d3dce6; 
    border-radius: 25px;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #ffffff;
    border-radius: 25px;
  }

  .contest-content-description{
    margin-top: 100px;
    height: 200px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  img{
    width: 100%;
    height: 100%;
  }
</style>
