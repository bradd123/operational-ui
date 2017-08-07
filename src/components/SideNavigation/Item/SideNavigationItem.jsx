// @flow
import React, { Component } from 'react';
import glamorous, { Img } from 'glamorous';

type props = {
  className: string,
  children: mixed,
  size?: number,
  theme: THEME,
};

const SideNavigationItem = ({ className, children }: props): React$Element<*> =>
  (<div className={className}>
    {children}
  </div>);

const style = ({ theme, size }: { theme: THEME, size: number }): {} => ({
  position: 'relative',
  width: size || 30,
  height: size || 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 2,
  cursor: 'pointer',

  ':first-child': {
    marginBottom: theme.spacing,
  },

  ':hover > .tooltip': {
    '--offsetLeft': 0,
    opacity: 1,
  },
});

export default glamorous(SideNavigationItem)(style);