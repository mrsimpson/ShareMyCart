import React, { Component } from "react"
import { withRouter } from "react-router"
import { observer, inject } from "mobx-react"
import BasicPage from "../basicpage/BasicPage"
import { IonList } from "@ionic/react";
import Item from "./Item";

class GoShoppingList extends Component {
  constructor (props) {
		super(props);
		this._hasUnmounted = false;
		this.state = { items: [] };
	}

	async componentDidMount () {
		if (this._hasUnmounted) {
			return;
    }
    try {
      const items = await this.props.store.getMyItems()
      if (!this._hasUnmounted) {
        this.setState({ items });
      }
		} catch(error) {
				console.error('error found', error);
    }
	}

	componentWillUnmount () {
		this._hasUnmounted = true;
	}

  render() {
    return <BasicPage
      title="Go Shopping"
      store={this.props.store}
      renderContent={history => {
        return <IonList>
          {this.state.items.map((item, key) => (<Item
            key={item.id || key}
            item={item}
            ownList={true}
            mode={'goshopping'}
          />))}
        </IonList>
      }}
      />
  }
}

export default withRouter(inject('store')(observer(GoShoppingList)));
