import React from 'react';
import Icon, {
	ReloadOutlined, SettingOutlined, CloseOutlined, ArrowUpOutlined, ArrowLeftOutlined, ArrowRightOutlined, QuestionOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faCoffee, faTable, faMapMarkedAlt, faWalking, faCarSide, faPlane,
} from '@fortawesome/free-solid-svg-icons'
import { faEye } from '@fortawesome/free-regular-svg-icons'

// Reference:
// https://github.com/FortAwesome/Font-Awesome/tree/master/js-packages/%40fortawesome - fa packages
// https://github.com/FortAwesome/react-fontawesome - fa reference
// https://fontawesome.com/icons?d=gallery&m=free - fa icons
// https://ant.design/components/icon/ - ant icons

// tests
// this is one object/component instance
// export const Test = (<FontAwesomeIcon icon={faCoffee} />);

// this is generator to return FA icon
// this is using props expanding, not recommended, only use if we will need it
// export const TestC = props => <FontAwesomeIcon icon={faCoffee} {...props} />;
// export const TestC = () => <FontAwesomeIcon icon={faCoffee} />;

// wrap it in an antd icon component as it gives special meaning to antd for the purpose of spacing (like in a button)
export const Test = () => <Icon component={() => (<FontAwesomeIcon icon={faCoffee} />)} />;

// added the following css globally to prevent issue with vertical align caused by having fa icon inside of an antd icon wrapper
// https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4
// https://github.com/FortAwesome/Font-Awesome/issues/16526
// TODO, find a way to embed that rule here locally instead of at a global level
/*
.anticon .svg-inline--fa {
  vertical-align: 0;
}
*/

// util
function generateFontAwesomeIcon(faType) {
	return () => <Icon component={() => (<FontAwesomeIcon icon={faType} />)} />;
}

// icons
// export const Data = () => <Icon component={() => (<FontAwesomeIcon icon={faTable} />)} />;
export const DataIcon = generateFontAwesomeIcon(faTable);
export const ReloadIcon = ReloadOutlined;
export const SettingsIcon = SettingOutlined;

export const LocationFixIcon = generateFontAwesomeIcon(faMapMarkedAlt);
export const LocationNoFixIcon = CloseOutlined;

export const DirectionForwardIcon = ArrowUpOutlined;
export const DirectionLeftIcon = ArrowLeftOutlined;
export const DirectionRightIcon = ArrowRightOutlined;
export const DirectionUnknownIcon = QuestionOutlined;

export const DistanceSightIcon = generateFontAwesomeIcon(faEye);
export const DistanceWalkIcon = generateFontAwesomeIcon(faWalking);
export const DistanceDriveIcon = generateFontAwesomeIcon(faCarSide);
export const DistanceFlyIcon = generateFontAwesomeIcon(faPlane);

export const InfoIcon = InfoCircleOutlined;

export const MapLinkIcon = generateFontAwesomeIcon(faMapMarkedAlt);

export default FontAwesomeIcon;
