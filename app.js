const {createApp} = Vue

const app = createApp({
  data() {
    return {
      message: 'Hello Vue!',
      count:0
    }
  },
template:`  <button @click="count++">You clicked me {{ count }} times .</button>`
});
app.mount("#app")