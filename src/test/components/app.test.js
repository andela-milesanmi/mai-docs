import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import App from '../../components/App.jsx';

describe('App component', () => {
  const wrapper = shallow(<App />);
  it('should render without crashing', () => {
    expect(wrapper).toExist();
  });
});
