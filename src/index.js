import React from './Luy/index'
import { render } from './vdom'

class App extends React.Component {
  render() {
    console.log('render')
    return (
      <div>
        <span />
        <span />
      </div>
    )
  }
}

render(<App />, document.getElementById('root'))