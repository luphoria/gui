import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { Help as HelpIcon } from '@material-ui/icons';

import { toggleHelptips } from '../../actions/userActions';
import { getDocsVersion } from '../../selectors';

const actionCreators = { toggleHelptips };
const mapStateToProps = state => {
  return {
    docsVersion: getDocsVersion(state)
  };
};

const HideHelptipsButton = ({ toggleHelptips }) => (
  <p>
    <a className="hidehelp" onClick={toggleHelptips}>
      Hide all help tips
    </a>
  </p>
);

const AuthButtonComponent = ({ highlightHelp, toggleHelptips }) => (
  <div>
    <div
      id="onboard-4"
      className={highlightHelp ? 'tooltip help highlight' : 'tooltip help'}
      data-tip
      data-for="auth-button-tip"
      data-event="click focus"
      style={{ left: '580px', top: '178px' }}
    >
      <HelpIcon />
    </div>
    <ReactTooltip id="auth-button-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <div style={{ whiteSpace: 'normal' }}>
        <h3>Authorize devices</h3>
        <hr />
        <p>
          Click this button to view the authentication options for this device. You can decide whether to accept it, reject it, or just dismiss this device for
          now.
        </p>
        <p>
          You can find out more about connecting different types of devices in <Link to="/help/getting-started">the help section</Link>.
        </p>
        <HideHelptipsButton toggleHelptips={toggleHelptips} />
      </div>
    </ReactTooltip>
  </div>
);
export const AuthButton = connect(mapStateToProps, actionCreators)(AuthButtonComponent);

const AddGroupComponent = ({ toggleHelptips }) => (
  <div>
    <div id="onboard-5" className="tooltip help" data-tip data-for="groups-tip" data-event="click focus" style={{ bottom: '-10px' }}>
      <HelpIcon />
    </div>
    <ReactTooltip id="groups-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <h3>Device groups</h3>
      <hr />
      <p>
        It is possible to create groups of devices. Once you have created a group and added one or more devices to it, you can deploy an update to that specific
        group only.
      </p>
      <p>To avoid accidents, Mender only allows a device to be in one group at the time.</p>
      <HideHelptipsButton toggleHelptips={toggleHelptips} />
    </ReactTooltip>
  </div>
);
export const AddGroup = connect(mapStateToProps, actionCreators)(AddGroupComponent);

const ExpandDeviceComponent = ({ docsVersion, toggleHelptips }) => (
  <div>
    <div id="onboard-6" className="tooltip help" data-tip data-for="expand-device-tip" data-event="click focus" style={{ left: 'inherit', right: '45px' }}>
      <HelpIcon />
    </div>
    <ReactTooltip id="expand-device-tip" globalEventOff="click" place="left" type="light" effect="solid" className="react-tooltip">
      <h3>Device inventory</h3>
      <hr />
      <p>
        Mender automatically collects identity and inventory information from connected devices. You can view this information by clicking on a device to expand
        the row.
      </p>
      <p>
        Which information is collected about devices is fully configurable;{' '}
        <a href={`https://docs.mender.io/${docsVersion}client-installation/identity`} target="_blank" rel="noopener noreferrer">
          see the documentation for how to configure this
        </a>
        .
      </p>
      <HideHelptipsButton toggleHelptips={toggleHelptips} />
    </ReactTooltip>
  </div>
);
export const ExpandDevice = connect(mapStateToProps, actionCreators)(ExpandDeviceComponent);

const ExpandArtifactComponent = ({ toggleHelptips }) => (
  <div>
    <div id="onboard-10" className="tooltip help" data-tip data-for="artifact-expand-tip" data-event="click focus">
      <HelpIcon />
    </div>
    <ReactTooltip id="artifact-expand-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <h3>Device type compatibility</h3>
      <hr />
      <p>
        Mender Artifacts have <b>Device types compatible</b> as part of their metadata. All devices report which device type they are, as part of their
        inventory information. During a deployment, Mender makes sure that a device will only download and install an Artifact it is compatible with.
      </p>
      <p>You can click on each Artifact in the Release to expand the row and view more information about it.</p>
      <HideHelptipsButton toggleHelptips={toggleHelptips} />
    </ReactTooltip>
  </div>
);
export const ExpandArtifact = connect(mapStateToProps, actionCreators)(ExpandArtifactComponent);
