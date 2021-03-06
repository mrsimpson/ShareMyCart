import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { compose } from 'recompose'

import ShoppingList from './ShoppingList'

import LoadingAnimation from '../../Reusables/ionic/LoadingAnimation'
import { withRouter } from 'react-router'
import { GO_SHOPPING } from '../../../constants/routes'
import { ITEM_TYPE_IN_SHOPPING, ITEM_TYPE_SHOPPING } from '../../../constants/items'
import { LIFECYCLE_STATUS_OPEN } from '../../../constants/lists'
import { IonList, IonItem } from '@ionic/react'
import CreateItem from '../../Item/ionic/CreateItem'

class Shopping extends Component {
	constructor(props) {
		super(props)

		this.state = {
			itemInCreation: {},
		}

		this.statusTransitionTriggered = false
	}

	componentDidUpdate() {
		if (!this.statusTransitionTriggered && this.props.shoppingStore.currentShoppingList) {
			this.props.model.onOpenShopping(this.props.shoppingStore.currentShoppingList)
			this.statusTransitionTriggered = true
		}
	}

	onCreatingItemChange(event) {
		this.setState({
			itemInCreation:
				Object.assign(this.state.itemInCreation, { [event.target.name]: event.target.value })
		})
	}

	onListNameChange(event) {
		this.setState({
			editingListName: event.target.value
		})
	}

	onCreateComplete(newItem) {
		if (!newItem.name || !newItem.quantity) {
			return
		}

		this.props.model.onCreateItemForCurrentShoppingList(newItem)
		this.setState({ itemInCreation: {} })
	}

	render() {
		const { shoppingStore, sessionStore, location, editMode } = this.props
		const {
			// shoppingListsArray: shoppingLists,
			currentShoppingList,
			currentShoppingListItemsArray: currentShoppingListItems,
			currentDependentNeedsListsArray: currentDependentNeedsLists,
			currentDependentNeedsListsItemsArray: currentDependentNeedsListsItems,
			initializationDone,
		} = shoppingStore

		const mode = location.pathname === GO_SHOPPING
			? ITEM_TYPE_IN_SHOPPING
			: ITEM_TYPE_SHOPPING

		if (!initializationDone) return <LoadingAnimation loading={initializationDone} />

		return (
			currentShoppingList &&
			<>
				{/* In edit mode, swap the item creation for an input to edit the list name */}
				{!editMode && currentShoppingList.lifecycleStatus === LIFECYCLE_STATUS_OPEN &&
					<IonList>
						<IonItem>
							<CreateItem
								item={this.state.itemInCreation}
								mode={ITEM_TYPE_SHOPPING}
								isFirstItem={!currentShoppingListItems.length}
								onChange={this.onCreatingItemChange.bind(this)}
								onEditingConcluded={this.onCreateComplete.bind(this)}
							/>
						</IonItem>
					</IonList>}
				<ShoppingList
					authUser={sessionStore.authUser}
					list={currentShoppingList}
					items={currentShoppingListItems}
					mode={mode}
					dependentNeedLists={currentDependentNeedsLists}
					bringAlongItems={currentDependentNeedsListsItems}
					onEditList={this.props.model.onEditShoppingList}
					onEditItem={this.props.model.onEditShoppingItem}
					onShopItem={this.props.model.onShopShoppingItem}
					onDeleteItem={this.props.model.onRemoveShoppingItem}
					onReorderItems={this.props.model.onReorderItems}
					editMode={this.props.editMode}
					addSaveEditHandler={this.props.addSaveEditHandler}
				/>
			</>
		)
	}
}

export default compose(
	withRouter,
	inject('shoppingStore', 'sessionStore'),
	observer,
)(Shopping)
