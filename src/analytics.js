// import * as $ from 'jquery';
//
// import('lodash').then( _=> {
//   console.log('Lodash', _.random(0, 42, true))
// })
//
// function createAnalytics() {
//   let counter = 0;
//   let isDestroy = false
//
//
//   const listener = () => counter++
//
//   $(document).on('click', listener)
//
//   return {
//     destroy() {
//       document.removeEventListener('click', listener)
//       isDestroy = true
//     },
//
//     getClick() {
//       if (isDestroy) {
//         return 'Analytics is destroyd'
//       }
//       return counter
//     }
//   }
// }
//
// window.analytics = createAnalytics()