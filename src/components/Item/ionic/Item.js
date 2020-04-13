import React, { Component } from "react";
import { IonItem, IonLabel, IonButton, IonIcon, IonReorder, IonCheckbox, IonList, IonChip } from "@ionic/react";
import EditItem from './EditItem';
import { trash, add, shareSocialOutline } from 'ionicons/icons';
import { ITEM_TYPE_IN_SHOPPING, ITEM_TYPE_SHOPPING, ITEM_TYPE_NEW_SHOPPING, ITEM_TYPE_NEED, ITEM_TYPE_POTENTIAL_NEED, ITEM_TYPE_BRING_ALONG } from "../../../constants/items";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import Avatar from "../../Reusables/ionic/Avatar";
import { toJS } from "mobx";

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inEdit: !props.item.quantity,
    };
  }

  setEditMode(inEdit) {
    if (!this.props.readOnly) {
      this.setState({ inEdit })
    }
  }

  onItemClick() {
    const { uid, parentId, shopped } = this.props.item;
    switch (this.props.mode) {
      case ITEM_TYPE_IN_SHOPPING:
      case ITEM_TYPE_BRING_ALONG:
        this.props.onShopItem(parentId, uid, !shopped)
        break;
      case ITEM_TYPE_POTENTIAL_NEED:
        break;
      default:
        this.setEditMode(true)
        break;
    }
  }

  render() {
    const {
      item,
      bringAlongItems,
      mode,
      ownList,
      owner,
      onCreateNeed,
      onDeleteItem,
      onEditingConcluded,
      onShopItem,
      readOnly,
    } = this.props;

    const needIcon = !ownList && !readOnly && mode === ITEM_TYPE_POTENTIAL_NEED &&
      <IonButton onClick={() => onCreateNeed(item)} fill="add" size="large" slot="end" color="primary">
        <IonIcon icon={add} />
      </IonButton>

    const showQuantityLabel = [ITEM_TYPE_NEED, ITEM_TYPE_IN_SHOPPING, ITEM_TYPE_BRING_ALONG].includes(mode) ||
      ([ITEM_TYPE_SHOPPING, ITEM_TYPE_NEW_SHOPPING].includes(mode) && (item.quantity > 1 || item.unit))
    const quantityLabel = showQuantityLabel &&
      <IonChip
        onClick={() => this.setEditMode(true)}
        color={!item.shopped ? "primary" : "success"}>
        <IonLabel color={!item.shopped ? "dark" : "success"}>
          {mode === ITEM_TYPE_BRING_ALONG && "+"}{item.quantity} {item.unit}
        </IonLabel>
      </IonChip>

    const showDeleteButton = ownList && !readOnly && mode !== ITEM_TYPE_IN_SHOPPING
    const deleteIcon = showDeleteButton && <IonButton className="button-end" fill="clear" size="large" slot="end" color="danger" onClick={() => onDeleteItem(item.uid)}>
      <IonIcon icon={trash} />
    </IonButton>

    const ownerIcon = owner && <IonButton fill="clear" size="large" slot="start"><Avatar size="30px" user={owner} /></IonButton>

    const BringAlongQuantity = () => {
      if (mode === ITEM_TYPE_SHOPPING && bringAlongItems && bringAlongItems.length) {
        const totalQuantity = bringAlongItems.reduce((total, bringAlongItem) => (total + Number(bringAlongItem.quantity)), 0)
        if (totalQuantity > 0) return (
          <span style={{ display: "flex" }}>
            <IonChip color="secondary">
              <IonIcon icon={shareSocialOutline} />
              <IonLabel color="secondary">
                +{totalQuantity} {item.unit}
              </IonLabel>
            </IonChip>
          </span>
        )
      }
      return null
    }

    const itemDisplay = this.state.inEdit ?
      <EditItem
        item={toJS(item)}
        onEditingConcluded={(item) => {
          this.setEditMode(false)
          onEditingConcluded(item)
        }
        }
        mode={mode}
      />
      :
      <>
        {[ITEM_TYPE_IN_SHOPPING, ITEM_TYPE_BRING_ALONG].includes(mode) &&
          <IonCheckbox
            slot="start"
            style={mode === ITEM_TYPE_BRING_ALONG ? { marginLeft: "40px" } : null}
            value={item.name}
            checked={item.shopped}
            onClick={() => this.onItemClick()}
            color="primary"
          />}
        <IonLabel onClick={() => this.onItemClick()}
          style={{
            cursor: 'pointer',
            textDecoration: (item.shopped ? 'line-through' : 'none'),
            color: (item.shopped ? 'grey' : 'black')
          }}>
          {!(mode === ITEM_TYPE_BRING_ALONG) && item.name}
        </IonLabel>
        <BringAlongQuantity />
        {ownerIcon}
        {quantityLabel}
        {needIcon}
        {deleteIcon}
      </>

    const dependentNeededItems = mode === ITEM_TYPE_IN_SHOPPING && bringAlongItems && (
      <IonList>
        {bringAlongItems
          .map(neededItem => {
            const owner = this.props.userStore.users[neededItem.ownerId]
            return (
              <Item
                key={neededItem.uid}
                item={neededItem}
                owner={owner}
                ownList={false}
                onShopItem={() =>
                  onShopItem(neededItem.parentId, neededItem.uid, !neededItem.shopped)}
                mode={ITEM_TYPE_BRING_ALONG} />
            )
          })
        }
      </IonList>
    )

    return (
      <>
        <IonItem id={item.uid}>
          <IonReorder slot="start" />
          {itemDisplay}
        </IonItem>
        {dependentNeededItems}
      </>
    )
  }
}

export default compose(
  inject('userStore'),
  observer,
)(Item);
