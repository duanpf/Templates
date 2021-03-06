// let baseUrl = "https://jingjiren.cqtyanglao.com/";//基础路径
let baseUrl = 'http://192.168.1.130:9010/'

// contentType= [ //请求头部2种
//   'application/x-www-form-urlencoded;charset=utf-8',
//   'application/json'
// ]
function wxPromise(method, url, data = {}, contentType = "application/json") {
  //返回一个Promise对象
  wx.showLoading({
    title: '加载中',
  })
  let wxUserdata = function () {
    return new Promise(function (resolve, reject) {
      wx.checkSession({
        success(e) {
          console.log("sesson未过期",3333)
          console.log(e)
          wx.getStorage({
            key: 'wxUserdata',
            success(res) {
              resolve(res.data)
            },
            fail(res) {
              console.log("sesson未过期", res)
              wx.login({
                success(res) {
                  if (res.code) {
                    //发起网络请
                    /**
                      * @Description: 获取openId
                      * @Author: LiSuwan
                      * @Date: 2019-10-13 19:16:57
                      */
                    wx.request({
                      url: baseUrl + 'my/login', //
                      method: 'get', //请求方式
                      data: {
                        jsCode: res.code
                      },
                      header: {
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                      },
                      success: res => {

                        let wxUserdata = {
                          sessionKey: res.data.data.sessionKey,
                          openId: res.data.data.openId
                        }

                        wx.setStorage({
                          key: 'wxUserdata',
                          data: JSON.stringify(wxUserdata),
                        })
                        resolve(JSON.stringify(wxUserdata))
                      }
                    })
                  } else {
                    console.log('登录失败！' + res.errMsg)
                  }
                }
              })
            }
          })

          
        },
        fail(e) {

          console.log("sesson过期", 4444)
          wx.login({
            success(res) {
              console.log("sesson过期", res)
              if (res.code) {
                //发起网络请
                /**
                  * @Description: 获取openId
                  * @Author: LiSuwan
                  * @Date: 2019-10-13 19:16:57
                  */
                wx.request({
                  url: baseUrl + 'my/login', //
                  method: 'get', //请求方式
                  data: {
                    jsCode: res.code
                  },
                  header: {
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                  },
                  success: res => {

                    let wxUserdata = {
                      sessionKey: res.data.data.sessionKey,
                      openId: res.data.data.openId
                    }

                    wx.setStorage({
                      key: 'wxUserdata',
                      data: JSON.stringify(wxUserdata),
                    })
                    resolve(JSON.stringify(wxUserdata))
                  }
                })
              } else {
                console.log('登录失败！' + res.errMsg)
              }
            }
          })

        }
      })

      
    })
  }
  return wxUserdata().then(res => {

    let openId = JSON.parse(res).openId;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: baseUrl + url,
        method: method,
        data: data,
        //在header中统一封装报文头，这样不用每个接口都写一样的报文头定义的代码
        header: {
          "Content-Type": contentType,
          "openId": openId
        },
        success: function (res) {
          if (!data || !data.hideLoading) {
            setTimeout(function () {
              wx.hideLoading();
            }, 100);
          }
          if (res.data.code == 200) {
            resolve(res);
          } else if (res.data.code == 400 && res.data.message == "该资讯不存在") {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              confirmColor: '#118EDE',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: `../Tips/Tips`
                  })
                }
              }
            });
          } else {
            //如果出现异常则弹出dialog

            wx.showModal({
              title: '提示',
              content: res.data.message,
              confirmColor: '#118EDE',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                }
              }
            });
          }
        },
        fail: function (res) {
          setTimeout(function () {
            wx.hideLoading();
          }, 100);
          wx.showToast({
            title: '服务器暂时无法连接',
            icon: 'loading',
            duration: 2000
          })
          reject(res);
        }
      });
    });

  })

  console.log(openId)




}


function getRequest(url, data, contentType) {
  return wxPromise("GET", url, data, contentType);
}


function postRequest(url, data, contentType) {

  return wxPromise("POST", url, data, contentType);
}

module.exports = {
  wxPromise: wxPromise,
  postRequest: postRequest,
  getRequest: getRequest,
}