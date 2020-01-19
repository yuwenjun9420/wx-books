// pages/me/me.js

const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal:'',
    userInfo:wx.getStorageSync("userInfo")||{}
  },
  onGetUserInfo(e){
    let info=e.detail.userInfo;
    //需要调用云函数，获取用户的openid
    wx.cloud.callFunction({
      name:"login",
      complete:res=>{
        info.openid=res.result.openid;
        this.setData({
          userInfo:info
        });
        //写入本地缓存
        wx.setStorageSync('userInfo', info);
        // console.log(res.result);
      }
    })
    console.log(info)
  },
  addBook(isbn){
    console.log(isbn);
    wx.showLoading({
      title: '正在添加...',
    })
    //调用云函数
    wx.cloud.callFunction({
      name:"getdouban",
      data:{
        isbn
      }
    }).then(({result})=>{
      //图书入库操作
      db.collection('doubanbooks').add({
        data:result
      }).then(res=>{
        wx.hideLoading();
        console.log(res);
        if(res._id){
          wx.showModal({
            title: '添加成功',
            content:`《${result.title}》添加成功`,
            showCancel:false
          })
        }
      })
    })
    .catch(e=>{
      wx.showToast({
        title: '图书添加失败',
        icon:'wran',
        duration:2000
      })
    })
    
  },
  //通过扫码的方式添加图书
  scanCode(){
    wx.scanCode({
      success: (res)=>{
        //console.log(res.result);
        //根据图书的isbn号，去豆瓣获取详情 res.result
        //9787805200132（三国演义），9787805200552（西游记）
        this.addBook(res.result);
      }
    })
  },
  keyInput(e){
    this.setData({
      inputVal:e.detail.value
    })
  },
  //通过输入图书的isbn方式添加图书
  inputAddBook(){
    let reg=/^\d{9}[0-9X]/;
    let isbn=this.data.inputVal.trim().replace(/-/,'');
    if(isbn&&reg.test(isbn)){
      this.addBook(isbn);
    }else{
      wx.showModal({
        title: '提示',
        content:'请重新输入isbn',
        showCancel:false
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    wx.setNavigationBarTitle({
      title: '个人中心',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})