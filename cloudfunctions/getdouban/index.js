// 云函数入口文件
const axios = require('axios')
const cheerio = require('cheerio')
const doubanbook = require('doubanbook')
const cloud = require('wx-server-sdk')

cloud.init()


async function searchDouban(isbn) {
  // console.log('isbn',isbn);
  const url = "https://search.douban.com/book/subject_search?search_text=" + isbn;
  let searchInfo = await axios.get(url);
  // console.log(searchInfo.data);
  //获取window._DATA_后的数据
  let reg = /window\.__DATA__ = "(.*)"/;
  if (reg.test(searchInfo.data)) {
    // console.log(RegExp.$1);
    let serachData = doubanbook(RegExp.$1)[0];
    return serachData
  } else {
    return null;
  }
}

async function getDouban(isbn) {
  let detailInfo = await searchDouban(isbn)

  // console.log(detailInfo.title, detailInfo.rating.value);
  //在详情页里，第二次爬虫（在node里使用jquery解析html）
  let detailPage = await axios.get(detailInfo.url)
  const $ = cheerio.load(detailPage.data)
  const info = $('#info').text().split('\n').map(v => v.trim()).filter(v => v);
  const author = info[1];
  console.log(info);
  let tags = [];
  $('#db-tags-section .indent a.tag').each((index, item) => {
    tags.push({
      title: $(item).text()
    })
  })
  let rate=Math.round(detailInfo.rating.value/2);
  let rate_value='★★★★★☆☆☆☆☆'.slice(5-rate,10-rate);
  let publish='';
  let price=0;
  info.forEach((item,index=2)=>{
    let reg=/出版社|定价/;
    let flag=reg.exec(item);
    if(flag){
      if(flag[0]==='出版社'){
        publish=flag.input.split(':')[1]
      }else{
        price=flag.input.split(':')[1]
      }
    }
  })
  let comment=[];
  $('#comments .comment').each((i,v)=>{
    comment.push({
      auth:$(v).find('.comment-info a').text(),
      content:$(v).find('.comment-content').text(),
      date:$(v).find('.comment-info span').eq(1).text()
    })
  })
  //console.log(comment);
  let sumary = $('#link-report .intro').text()
  // console.log(sumary);
  const ret = {
    create_time: new Date().getTime(),
    title: detailInfo.title,
    rate: detailInfo.rating.value,
    rate_value,
    image: detailInfo.cover_url,
    url: detailInfo.url,
    author,
    tags,
    sumary,
    publish,
    price,
    page_view:0,
    comment,
    user_info:{avatarUrl:'https://img1.doubanio.com/icon/user_normal.jpg'}
  }
  console.log(ret);
  return ret;
}
//本地调试  9787111376613
//console.log(getDouban('9787805674254'));

exports.main = async (event, context) => {
  const {isbn} = event
  return await getDouban(isbn);
}