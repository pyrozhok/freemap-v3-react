import update from 'immutability-helper';

const initialState = {
  tool: null,

  mapType: 'T',
  center: {
    lat: 48.70714,
    lon: 19.4995
  },
  zoom: 8,
  overlays: []
};


export default function map(state = initialState, action) {
  switch (action.type) {
    case 'SET_TOOL':
      return update(state, { tool: { $set: action.tool === state.tool ? null : action.tool } } );
    case 'SET_MAP_BOUNDS':
      return update(state, { bounds: { $set: action.bounds } } );
    case 'REFOCUS':
      return update(state, { 
        zoom: { $set: action.zoom }, 
        center: {
          lat : {$set: action.lat}, 
          lon : {$set: action.lon}
        }, 
      });
    default:
      return state;
  }
}
