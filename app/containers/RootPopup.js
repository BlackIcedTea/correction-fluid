import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import Popup from './Popup'

export default class RootPopup extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  };

  render() {
    const { store } = this.props

    return (
      <Provider store={store}>
        <Popup />
      </Provider>
    )
  }
}
