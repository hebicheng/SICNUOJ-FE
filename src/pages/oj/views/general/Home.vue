<!--
 * @Descripttion:
 * @version:
 * @Author: hebicheng
 * @Date: 2020-11-01 10:29:17
 * @LastEditors: hebicheng
 * @LastEditTime: 2020-11-28 10:28:21
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
                <Button size="small" shape="circle" :type="contest.status === '0' ? 'success' : 'warning'" >{{$t('m.' + CONTEST_STATUS_REVERSE[contest.status].name.replace(/ /g, "_"))}}
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
              <ButtonGroup shape="circle" class="btn-group">
                <Button :type="contest.status === '0' ? 'success' : 'warning'" @click="goContest(index)">
                  {{ contest.status === '0' ? $t('m.Enter_Contest') : $t('m.Preview_Contest') }}
                  <Icon type="chevron-right"></Icon>
                </Button>
            </ButtonGroup>
            </div>
          </el-carousel-item> 
        </div>
        <el-carousel-item>
          <a href="https://sicnu.ac.cn"><img src="/public/upload/home-banner-1.png" alt=""></a>
        </el-carousel-item>
        <el-carousel-item v-if="images[0]">
          <a href="https://sicnu.ac.cn/gitlab"><img src="/public/upload/home-banner-2.png" alt=""></a>
        </el-carousel-item>
        <el-carousel-item v-if="images[1]">
          <img src="/public/upload/home-banner-3.png" alt="">
        </el-carousel-item>
      </el-carousel>
    
      <!-- <div class="home-pick-one">
      </div> -->
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
  import 'element-ui/lib/theme-chalk/index.css'

  export default {
    name: 'home',
    components: {
      Announcements
    },
    data () {
      return {
        images: [],
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
      this.getExtraImage('/../public/upload/home-banner-2.png')
      this.getExtraImage('/../public/upload/home-banner-3.png')
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
      async getExtraImage (url) {
        await axios
        .get(url)
        .then(response => {
          this.images.push(url)
        })
        .catch(error => {
          console.log(error)
        })
      }
    }
  }
</script>

<style lang="less" scoped>
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
    margin-top: 120px;
    height: 200px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  // img{
  //   width: 100%;
  //   height: 100%;
  // }
  
  .btn-group{
    bottom: 30px;
  }
  .home-pick-one{
    background: white;
    height: 100px;
    margin-top: 20px;
    border-radius: 25px;
  }

</style>
