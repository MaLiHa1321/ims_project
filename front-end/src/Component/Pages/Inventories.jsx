import React from 'react';
import { Container } from 'react-bootstrap';
import InventoryList from '../Pages/InventoryList';
const Inventories = () => {
  return (
    <Container>
      <InventoryList type="all" title="All Inventories" />
    </Container>
  );
};

export default Inventories;