// 数据劫持函数
function Observe(data) {
  // 增加get set
  for (let key in data) {
    let dep = new Dep()
    let val = data[key]
    observe(val)
    Object.defineProperty(data, key, {
      configurable: true,
      get() {
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set(newVal) {
        if (val === newVal) return
        val = newVal
        observe(newVal)
        
        dep.notify()
      }
    })
  }
}
// 数据劫持函数的包装 防止递归溢出
function observe(data) {
  if (!data || typeof data !== 'object') return
  return new Observe(data)
}
/** 发布订阅  **/
function Dep() {
  // 存放监听函数的事件池
  this.subs = []
}
Dep.prototype = {
  addSub(sub) {
    this.subs.push(sub)
  },
  notify() {
    this.subs.forEach(sub => sub.update())
  }
}
// 监听函数
function Watcher(mvvm, exp, fn) {
  this.fn = fn
  this.mvvm = mvvm
  this.exp = exp
  
  Dep.target = this
  let arr = exp.split('.')
  let val = mvvm
  arr.forEach(key => {
    val = val[key]
  })
  Dep.target = null
}
Watcher.prototype.update = function() {
  let arr = this.exp.split('.')
  let val = this.mvvm
  arr.forEach(key => {
    val = val[key]
  })
  this.fn(val)
}
// 数据编译函数
function Compile(el, mvvm) {
  mvvm.$el = document.querySelector(el)
  
  if (mvvm.$el === null) return
    
  let fragment = document.createDocumentFragment()
  
  while(child = mvvm.$el.firstChild) {
    fragment.appendChild(child)
  }
  
  function replace(frag) {
    Array.from(frag.childNodes).forEach(node => {
      let txt = node.textContent
      let reg = /\{\{(.*?)\}\}/g
      
      if (node.nodeType === 3 && reg.test(txt)) {
        function replaceText() {          
          node.textContent = txt.replace(reg, (matched, placeholder) => {
            
            new Watcher(mvvm, placeholder, replaceText)
            
            return placeholder.split('.').reduce((val, key) => {
              return val[key]
            }, mvvm)
          })
          
          // 监听变化
          new Watcher(mvvm, RegExp.$1, newVal => {
            node.textContent = txt.replace(reg, newVal).trim()
          })
        }
        replaceText()
      }
      
      if (node.childNodes && node.childNodes.length) {
        replace(node)
      }
    })
  }
  // function replace(frag) {
  //   Array.from(frag.childNodes).forEach(node => {
  //     let txt = node.textContent
  //     let reg = /\{\{(.*?)\}\}/g
      
  //     if (node.nodeType === 3 && reg.test(txt)) {
  //       let arr = RegExp.$1.split('.')
  //       let val = mvvm
  //       arr.forEach(key => {
  //         val = val[key]
  //       })
        
  //       node.textContent = txt.replace(reg, val).trim()
        
  //       // 监听变化
  //       new Watcher(mvvm, RegExp.$1, newVal => {
  //         node.textContent = txt.replace(reg, newVal).trim()
  //       })
  //     }
      
  //     if (node.childNodes && node.childNodes.length) {
  //       replace(node)
  //     }
  //   })
  // }
  
  replace(fragment)
  
  mvvm.$el.appendChild(fragment)
}



// let watcher = new Watcher(() => console.log(111))

// let dep = new Dep()

// dep.addSub(watcher)
// dep.addSub(watcher)
// dep.notify()

function Mvvm(options = {}) {
  this.$options = options;
  let data = this._data = this.$options.data;
  observe(data)
  // 数据代理
  for (let key in data) {
    Object.defineProperty(this, key, {
      configurable: true,
      get() {
        return this._data[key]
      },
      set(newVal) {
        this._data[key] = newVal
      }
    })
  }
  // 数据编译
  new Compile(options.el, this);
}