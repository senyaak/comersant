describe('computePropertyStep', () => {
  it.todo('returns TAX_PAID with the cell tax when the property is owned by another player');
  it.todo('returns PROPERTY_OFFERED with the cell price when the property has no owner');
  it.todo('returns an empty effect list when the current player already owns the property');
});

describe('computeBuyProperty', () => {
  it.todo('throws when the buyer is not in the players list');
  it.todo('throws when the resolved cell is not a PropertyCell');
  it.todo('throws when the buyer already owns the property');
  it.todo('throws when the buyer has insufficient funds');
  it.todo('returns PROPERTY_PURCHASED with previousOwnerId=null for an unowned property');
  it.todo('returns PROPERTY_PURCHASED carrying the previous owner id when re-buying');
});

describe('computeLoseProperty', () => {
  it.todo('returns PROPERTY_LOST with propertyIndex=null when the player owns nothing of the requested grade');
  it.todo('returns PROPERTY_LOST with the index of an owned property of the requested grade');
  it.todo('only considers properties owned by the current player');
  it.todo('only considers Business cells whose grade matches the request (Enterprise vs Office)');
});
