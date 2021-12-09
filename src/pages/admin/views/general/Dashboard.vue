<template>
  <el-row type="flex" :gutter="20">
    <el-col :md="10" :lg="8">
      <el-card class="admin-info">
        <el-row :gutter="20">
          <el-col :span="10">
            <img class="avatar" :src="profile.avatar"/>
          </el-col>
          <el-col :span="14">
            <p class="admin-info-name">{{user.username}}</p>
            <p>{{user.admin_type}}</p>
          </el-col>
        </el-row>
        <hr/>
        <div class="last-info">
          <p class="last-info-title">{{$t('m.Last_Login')}}</p>
          <el-form label-width="80px" class="last-info-body">
            <el-form-item label="Time:">
              <span>{{session.last_activity | localtime}}</span>
            </el-form-item>
            <el-form-item label="IP:">
              <span>{{session.ip}}</span>
            </el-form-item>
            <el-form-item label="OS">
              <span>{{os}}</span>
            </el-form-item>
            <el-form-item label="Browser:">
              <span>{{browser}}</span>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
      <div class="info-container" v-if="isSuperAdmin">
        <el-card>
          <info-card color="#909399" icon="el-icon-fa-users" message="Total Users" iconSize="30px" class="info-item"
                      :value="infoData.user_count"></info-card>
          <info-card color="#67C23A" icon="el-icon-fa-list" message="Today Submissions" class="info-item"
                      :value="infoData.today_submission_count"></info-card>
          <info-card color="#409EFF" icon="el-icon-fa-trophy" message="Recent Contests" class="info-item"
                      :value="infoData.recent_contest_count"></info-card>
        </el-card>
      </div>
      
    </el-col>

    <el-col :md="14" :lg="16" v-if="isSuperAdmin">
      <panel :title="$t('m.System_Overview')" v-if="isSuperAdmin">
        <p>{{$t('m.DashBoardJudge_Server')}}:  {{infoData.judge_server_count}}</p>
        <p>{{$t('m.HTTPS_Status')}}:
          <el-tag :type="https ? 'success' : 'danger'" size="small">
            {{ https ? 'Enabled' : 'Disabled'}}
          </el-tag>
        </p>
        <p>{{$t('m.Force_HTTPS')}}:
          <el-tag :type="forceHttps ? 'success' : 'danger'" size="small">
            {{forceHttps ? 'Enabled' : 'Disabled'}}
          </el-tag>
        </p>
        <p>{{$t('m.CDN_HOST')}}:
          <el-tag :type="cdn ? 'success' : 'warning'" size="small">
            {{cdn ? cdn : 'Not Use'}}
          </el-tag>
        </p>
      </panel>

      <div class="view">
        <Panel :title="$t('m.Judge_Server_Token')">
          <code>{{ token }}</code>
        </Panel>
        <Panel :title="$t('m.Judge_Server_Info')">
          <el-table
            :data="servers"
            :default-expand-all="true"
            border>
            <el-table-column
              type="expand">
              <template slot-scope="props">
                <p>{{$t('m.IP')}}:
                  <el-tag type="success">{{ props.row.ip }}</el-tag>&nbsp;&nbsp;
                  {{$t('m.Judger_Version')}}:
                  <el-tag type="success">{{ props.row.judger_version }}</el-tag>
                </p>
                <p>{{$t('m.Service_URL')}}: <code>{{ props.row.service_url }}</code></p>
                <p>{{$t('m.Last_Heartbeat')}}: {{ props.row.last_heartbeat | localtime}}</p>
                <p>{{$t('m.Create_Time')}}: {{ props.row.create_time | localtime }}</p>
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              label="Status">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.status === 'normal' ? 'success' : 'danger'">
                  {{ scope.row.status === 'normal' ? 'Normal' : 'Abnormal' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="hostname"
              label="Hostname">
            </el-table-column>
            <el-table-column
              prop="task_number"
              label="Task Number">
            </el-table-column>
            <el-table-column
              prop="cpu_core"
              label="CPU Core">
            </el-table-column>
            <el-table-column
              prop="cpu_usage"
              label="CPU Usage">
              <template slot-scope="scope">{{ scope.row.cpu_usage }}%</template>
            </el-table-column>
            <el-table-column
              prop="memory_usage"
              label="Memory Usage">
              <template slot-scope="scope">{{ scope.row.memory_usage }}%</template>
            </el-table-column>
            <el-table-column label="Disabled">
              <template slot-scope="{row}">
                <el-switch v-model="row.is_disabled" @change="handleDisabledSwitch(row.id, row.is_disabled)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              label="Options">
              <template slot-scope="scope">
                <icon-btn name="Delete" icon="trash" @click.native="deleteJudgeServer(scope.row.hostname)"></icon-btn>
              </template>
            </el-table-column>
          </el-table>
        </Panel>
      </div>
    </el-col>
  </el-row>
</template>


<script>
  import { mapGetters } from 'vuex'
  import browserDetector from 'browser-detect'
  import InfoCard from '@admin/components/infoCard.vue'
  import api from '@admin/api'

  export default {
    name: 'dashboard',
    components: {
      InfoCard
    },
    data () {
      return {
        infoData: {
          user_count: 0,
          recent_contest_count: 0,
          today_submission_count: 0,
          judge_server_count: 0,
          env: {}
        },
        activeNames: [1],
        session: {},
        loadingReleases: true,
        releases: [],
        servers: [],
        token: '',
        intervalId: -1
      }
    },
    mounted () {
      api.getDashboardInfo().then(resp => {
        this.infoData = resp.data.data
        if (this.isSuperAdmin) {
          this.refreshJudgeServerList()
          this.intervalId = setInterval(() => {
            this.refreshJudgeServerList()
          }, 5000)
        }
      }, () => {
      })
      api.getSessions().then(resp => {
        this.parseSession(resp.data.data)
      }, () => {
      })
      api.getReleaseNotes().then(resp => {
        this.loadingReleases = false
        let data = resp.data.data
        if (!data) {
          return
        }
        let currentVersion = data.local_version
        data.update.forEach(release => {
          if (release.version > currentVersion) {
            release.new_version = true
          }
        })
        this.releases = data.update
      }, () => {
        this.loadingReleases = false
      })
    },
    methods: {
      parseSession (sessions) {
        let session = sessions[0]
        if (sessions.length > 1) {
          session = sessions.filter(s => !s.current_session).sort((a, b) => {
            return a.last_activity < b.last_activity
          })[0]
        }
        this.session = session
      },
      refreshJudgeServerList () {
        api.getJudgeServer().then(res => {
          this.servers = res.data.data.servers
          this.token = res.data.data.token
        })
      },
      deleteJudgeServer (hostname) {
        this.$confirm('If you delete this judge server, it can\'t be used until next heartbeat', 'Warning', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          api.deleteJudgeServer(hostname).then(res =>
            this.refreshJudgeServerList()
          )
        }).catch(() => {
        })
      },
      handleDisabledSwitch (id, value) {
        let data = {
          id,
          is_disabled: value
        }
        api.updateJudgeServer(data).catch(() => {})
      }
    },
    computed: {
      ...mapGetters(['profile', 'user', 'isSuperAdmin']),
      cdn () {
        return this.infoData.env.STATIC_CDN_HOST
      },
      https () {
        return document.URL.slice(0, 5) === 'https'
      },
      forceHttps () {
        return this.infoData.env.FORCE_HTTPS
      },
      browser () {
        let b = browserDetector(this.session.user_agent)
        if (b.name && b.version) {
          return b.name + ' ' + b.version
        } else {
          return 'Unknown'
        }
      },
      os () {
        let b = browserDetector(this.session.user_agent)
        return b.os ? b.os : 'Unknown'
      }
    },
    beforeRouteLeave (to, from, next) {
      clearInterval(this.intervalId)
      next()
    }
  }
</script>

<style lang="less">
  .admin-info {
    margin-bottom: 20px;
    &-name {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #409EFF;
    }
    .avatar {
      max-width: 100%;
    }
    .last-info {
      &-title {
        font-size: 16px;
      }
      &-body {
        .el-form-item {
          margin-bottom: 5px;
        }
      }
    }
  }

  .info-container {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    .info-item {
      flex: 1 0 auto;
      min-width: 400px;
      margin-bottom: 10px;
    }
  }

</style>
