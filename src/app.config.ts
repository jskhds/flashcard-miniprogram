export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/decks/index',
    'pages/stats/index',
    'pages/cards/index',
    'pages/card-edit/index',
    'pages/review/index',
    'pages/review-summary/index',
    'pages/deck-template/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFF8F0',
    navigationBarTitleText: '闪卡',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFF8F0'
  },
  tabBar: {
    color: '#A0907E',
    selectedColor: '#F4845F',
    backgroundColor: '#FFF8F0',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/decks/index',
        text: '卡组',
        iconPath: 'assets/icons/decks.png',
        selectedIconPath: 'assets/icons/decks-active.png'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计',
        iconPath: 'assets/icons/stats.png',
        selectedIconPath: 'assets/icons/stats-active.png'
      }
    ]
  }
})
