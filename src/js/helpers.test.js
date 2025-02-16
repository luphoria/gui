import React from 'react';
import renderer from 'react-test-renderer';
import {
  customSort,
  decodeSessionToken,
  deepCompare,
  detectOsIdentifier,
  duplicateFilter,
  extractSoftware,
  extractSoftwareInformation,
  FileSize,
  formatPublicKey,
  formatTime,
  fullyDecodeURI,
  generateDeploymentGroupDetails,
  getDebConfigurationCode,
  getDebInstallationCode,
  getDemoDeviceAddress,
  getDemoDeviceCreationCommand,
  getFormattedSize,
  getPhaseDeviceCount,
  getRemainderPercent,
  hashString,
  isEmpty,
  mapDeviceAttributes,
  preformatWithRequestID,
  standardizePhases,
  statusToPercentage,
  stringToBoolean,
  tryMapDeployments,
  unionizeStrings,
  validatePhases,
  versionCompare
} from './helpers';
import { defaultState, token, undefineds } from '../../tests/mockData';

describe('FileSize Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<FileSize fileSize={1000} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).not.toMatch(undefineds);
  });
});

describe('getFormattedSize function', () => {
  it('converts correctly', async () => {
    expect(getFormattedSize()).toEqual('0 Bytes');
    expect(getFormattedSize(null)).toEqual('0 Bytes');
    expect(getFormattedSize(0)).toEqual('0 Bytes');
    expect(getFormattedSize(31)).toEqual('31.00 Bytes');
    expect(getFormattedSize(1024)).toEqual('1.00 KB');
    expect(getFormattedSize(1024 * 1024)).toEqual('1.00 MB');
    expect(getFormattedSize(1024 * 1024 * 2.5)).toEqual('2.50 MB');
    expect(getFormattedSize(1024 * 1024 * 1024 * 1.2345)).toEqual('1.23 GB');
  });
});

describe('isEmpty function', () => {
  it('should identify empty objects', async () => {
    expect(isEmpty({})).toEqual(true);
  });
  it('should identify non-empty objects', async () => {
    expect(isEmpty({ a: 1 })).toEqual(false);
  });
  it('should identify an object with nested empty objects as non-empty', async () => {
    expect(isEmpty({ a: {} })).toEqual(false);
  });
});

describe('stringToBoolean function', () => {
  it('should convert truthy objects', async () => {
    expect(stringToBoolean(1)).toEqual(true);
    expect(stringToBoolean('1')).toEqual(true);
    expect(stringToBoolean(true)).toEqual(true);
    expect(stringToBoolean('yes')).toEqual(true);
    expect(stringToBoolean('TRUE')).toEqual(true);
    expect(stringToBoolean('something')).toEqual(true);
  });
  it('should convert truthy objects', async () => {
    expect(stringToBoolean(0)).toEqual(false);
    expect(stringToBoolean('0')).toEqual(false);
    expect(stringToBoolean(false)).toEqual(false);
    expect(stringToBoolean('no')).toEqual(false);
    expect(stringToBoolean('FALSE')).toEqual(false);
  });
});

describe('versionCompare function', () => {
  it('should works as intended', () => {
    expect(versionCompare('2.5.1', '2.6.0').toString()).toEqual('-1');
    expect(versionCompare('2.6.0', '2.6.0').toString()).toEqual('0');
    expect(versionCompare('2.6.x', '2.6.0').toString()).toEqual('1');
    expect(versionCompare('next', '2.6').toString()).toEqual('1');
    expect(versionCompare('', '2.6.0').toString()).toEqual('-1');
  });
});

describe('getDebInstallationCode function', () => {
  it('should not contain any template string leftovers', async () => {
    expect(getDebInstallationCode()).not.toMatch(/\$\{([^}]+)\}/);
  });
  it('should return a sane result', () => {
    expect(getDebInstallationCode(undefined, undefined, true)).toMatch(`wget -q -O- https://get.mender.io/ | sudo bash -s -- -c experimental`);
  });
  it('should return a sane result for old installations', async () => {
    expect(getDebInstallationCode('master'))
      .toMatch(`wget https://d1b0l86ne08fsf.cloudfront.net/master/dist-packages/debian/armhf/mender-client_master-1_armhf.deb && \\
sudo dpkg -i --force-confdef --force-confold mender-client_master-1_armhf.deb`);
  });
});

describe('getDebConfigurationCode function', () => {
  let code;
  beforeEach(() => {
    code = getDebConfigurationCode('192.168.7.41', false, true, 'token', 'master', 'raspberrypi3', true);
  });
  it('should not contain any template string leftovers', async () => {
    expect(code).not.toMatch(/\$\{([^}]+)\}/);
  });
  it('should return a sane result', async () => {
    expect(code).toMatch(
      `wget -q -O- https://get.mender.io/ | sudo bash -s -- -c experimental && \\
sudo bash -c 'DEVICE_TYPE="raspberrypi3" && \\
TENANT_TOKEN="token" && \\
mender setup \\
  --device-type $DEVICE_TYPE \\
  --quiet --demo --server-ip 192.168.7.41 \\
  --tenant-token $TENANT_TOKEN && \\
systemctl restart mender-client && \\
(cat > /etc/mender/mender-connect.conf << EOF
{
  "ServerURL": "http://localhost",
  "User": "pi",
  "ShellCommand": "/bin/bash"
}
EOF
) && systemctl restart mender-connect'`
    );
  });
  it('should return a sane result for old installations', async () => {
    code = getDebConfigurationCode('192.168.7.41', false, true, 'token', 'master', 'raspberrypi3');
    expect(code).toMatch(`sudo bash -c 'wget https://d1b0l86ne08fsf.cloudfront.net/master/dist-packages/debian/armhf/mender-client_master-1_armhf.deb && \\
DEBIAN_FRONTEND=noninteractive dpkg -i --force-confdef --force-confold mender-client_master-1_armhf.deb && \\
DEVICE_TYPE="raspberrypi3" && \\
TENANT_TOKEN="token" && \\
mender setup \\
  --device-type $DEVICE_TYPE \\
  --quiet --demo --server-ip 192.168.7.41 \\
  --tenant-token $TENANT_TOKEN && \\
systemctl restart mender-client'`);
  });
  it('should not contain tenant information for OS calls', async () => {
    code = getDebConfigurationCode('192.168.7.41', false, false, null, 'master', 'raspberrypi3');
    expect(code).not.toMatch(/tenant/);
    expect(code).not.toMatch(/token/);
  });
});

describe('getDemoDeviceCreationCommand function', () => {
  const token = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW5kZXIudGVuYW50IjoiNWY5YWI0ZWQ4ZjhhMzc0NmYwYTIxNjU1IiwiaXNzIjoiTWVuZGVyIiwic3`;
  it('should not contain any template string leftovers', async () => {
    let code = getDemoDeviceCreationCommand();
    expect(code).not.toMatch(/\$\{([^}]+)\}/);
    code = getDemoDeviceCreationCommand(token);
    expect(code).not.toMatch(/\$\{([^}]+)\}/);
  });
  it('should return a sane result', async () => {
    let code = getDemoDeviceCreationCommand();
    expect(code).toMatch('./demo --client up');
    code = getDemoDeviceCreationCommand(token);
    expect(code).toMatch(
      `TENANT_TOKEN='${token}'\ndocker run -it -p 85:85 -e SERVER_URL='https://localhost' \\\n-e TENANT_TOKEN=$TENANT_TOKEN mendersoftware/mender-client-qemu:latest`
    );
  });
});

describe('hashString function', () => {
  it('should use md5 hashing internally', async () => {
    const md5Hash = '098f6bcd4621d373cade4e832627b4f6';
    expect(hashString('test')).toEqual(md5Hash);
  });
});

describe('duplicateFilter function', () => {
  it('removes duplicastes from an array', async () => {
    expect([].filter(duplicateFilter)).toEqual([]);
    expect([1, 1, 2, 3, 4, 5].filter(duplicateFilter)).toEqual([1, 2, 3, 4, 5]);
    expect(['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'].filter(duplicateFilter)).toEqual(['hey', 'ho', 'heyho']);
  });
});

describe('unionizeStrings function', () => {
  it('joins arrays of strings to a list of distinct strings', async () => {
    expect(unionizeStrings([], [])).toEqual([]);
    expect(unionizeStrings(['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'], ['hohoho'])).toEqual(['hey', 'ho', 'heyho', 'hohoho']);
    expect(unionizeStrings(['hohoho'], ['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'])).toEqual(['hohoho', 'hey', 'ho', 'heyho']);
    expect(unionizeStrings(['hohoho', 'hohoho'], ['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'])).toEqual(['hohoho', 'hey', 'ho', 'heyho']);
  });
});

describe('mapDeviceAttributes function', () => {
  const defaultAttributes = {
    inventory: { device_type: '', artifact_name: '' },
    identity: {},
    system: {}
  };
  it('works with empty attributes', async () => {
    expect(mapDeviceAttributes()).toEqual(defaultAttributes);
    expect(mapDeviceAttributes([])).toEqual(defaultAttributes);
  });
  it('handles unscoped attributes', async () => {
    const testAttributesObject1 = { name: 'this1', value: 'that1' };
    expect(mapDeviceAttributes([testAttributesObject1])).toEqual({
      ...defaultAttributes,
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1'
      }
    });
    const testAttributesObject2 = { name: 'this2', value: 'that2' };
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2])).toEqual({
      ...defaultAttributes,
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1',
        this2: 'that2'
      }
    });
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2, testAttributesObject2])).toEqual({
      ...defaultAttributes,
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1',
        this2: 'that2'
      }
    });
  });
  it('handles scoped attributes', async () => {
    const testAttributesObject1 = { name: 'this1', value: 'that1', scope: 'inventory' };
    expect(mapDeviceAttributes([testAttributesObject1])).toEqual({
      ...defaultAttributes,
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1'
      }
    });
    const testAttributesObject2 = { name: 'this2', value: 'that2', scope: 'identity' };
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2])).toEqual({
      ...defaultAttributes,
      identity: {
        ...defaultAttributes.identity,
        this2: 'that2'
      },
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1'
      }
    });
    expect(mapDeviceAttributes([testAttributesObject1, testAttributesObject2, testAttributesObject2])).toEqual({
      ...defaultAttributes,
      identity: {
        ...defaultAttributes.identity,
        this2: 'that2'
      },
      inventory: {
        ...defaultAttributes.inventory,
        this1: 'that1'
      }
    });
  });
});

describe('getPhaseDeviceCount function', () => {
  it('works with empty attributes', async () => {
    expect(getPhaseDeviceCount(120, 10, 20, false)).toEqual(12);
    expect(getPhaseDeviceCount(120, 10, 20, true)).toEqual(12);
    expect(getPhaseDeviceCount(120, null, 20, true)).toEqual(24);
    expect(getPhaseDeviceCount(120, null, 20, false)).toEqual(24);
    expect(getPhaseDeviceCount(undefined, null, 20, false)).toEqual(0);
  });
});
describe('customSort function', () => {
  it('works as expected', async () => {
    const creationSortedUp = Object.values(defaultState.deployments.byId).sort(customSort(false, 'created'));
    expect(creationSortedUp[1].id).toEqual(defaultState.deployments.byId.d1.id);
    expect(creationSortedUp[0].id).toEqual(defaultState.deployments.byId.d2.id);
    const creationSortedDown = Object.values(defaultState.deployments.byId).sort(customSort(true, 'created'));
    expect(creationSortedDown[0].id).toEqual(defaultState.deployments.byId.d1.id);
    expect(creationSortedDown[1].id).toEqual(defaultState.deployments.byId.d2.id);
    const idSortedUp = Object.values(defaultState.deployments.byId).sort(customSort(false, 'id'));
    expect(idSortedUp[0].id).toEqual(defaultState.deployments.byId.d1.id);
    expect(idSortedUp[1].id).toEqual(defaultState.deployments.byId.d2.id);
    const idSortedDown = Object.values(defaultState.deployments.byId).sort(customSort(true, 'id'));
    expect(idSortedDown[1].id).toEqual(defaultState.deployments.byId.d1.id);
    expect(idSortedDown[0].id).toEqual(defaultState.deployments.byId.d2.id);
  });
});
describe('decodeSessionToken function', () => {
  it('works as expected', async () => {
    expect(decodeSessionToken(token)).toEqual('a30a780b-b843-5344-80e3-0fd95a4f6fc3');
  });
  it('does not crash with faulty input', async () => {
    expect(decodeSessionToken(false)).toEqual(undefined);
  });
});
describe('deepCompare function', () => {
  it('works as expected', async () => {
    expect(deepCompare(false, 12)).toBeFalsy();
    expect(deepCompare(defaultState, {})).toBeFalsy();
    expect(
      deepCompare(defaultState, {
        ...defaultState,
        devices: { ...defaultState.devices, byId: { ...defaultState.devices.byId, a1: { ...defaultState.devices.byId.a1, id: 'test' } } }
      })
    ).toBeFalsy();
    expect(deepCompare({}, {})).toBeTruthy();
    expect(deepCompare({}, {}, {})).toBeTruthy();
    expect(deepCompare(defaultState.devices.byId, { ...defaultState.devices.byId }, { ...defaultState.devices.byId })).toBeTruthy();
    expect(deepCompare(['test', { test: 'test' }, 1], ['test', { test: 'test' }, 1])).toBeTruthy();
    expect(deepCompare(undefined, null)).toBeFalsy();
    expect(deepCompare(1, 2)).toBeFalsy();
    expect(deepCompare(1, 1)).toBeTruthy();
    const date = new Date();
    expect(deepCompare(date, date)).toBeTruthy();
    expect(deepCompare(date, new Date().setDate(date.getDate() - 1))).toBeFalsy();
    expect(deepCompare(<FileSize />, <FileSize />)).toBeTruthy();
    expect(deepCompare(defaultState, {})).toBeFalsy();
  });
});
describe('detectOsIdentifier function', () => {
  it('works as expected', async () => {
    expect(detectOsIdentifier()).toEqual('Linux');
    navigator.appVersion = '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';
    expect(detectOsIdentifier()).toEqual('MacOs');
  });
});
describe('formatPublicKey function', () => {
  it('works as expected', async () => {
    const key = `-----BEGIN PUBLIC KEY-----
MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA4XP347xOgC0PnBgplast
GmsSDWZE2nMCAkV9wx2J09hzqlEWK8tOOIS99IpAR4TtwIQi2GssNyGBBNRNMfLi
8E2JLalm/X2jFdutf4QVIvLOs1vT0FqpYH+B3BnocYC5TfBXAwVUoW8HxK0MuxBo
UTixFC4o2Wu3fQs+mMiVnV/jcYAV1O0N4+lgszObX8Buq8l817HB3WzUw/XxOyxC
yahN4skp1D9JFHZB3i6lnfSJNJJvABe/lLf2jnjeFzbBgJOGxzolBa3+UyAWJRLB
JxsSxbbnXS3vAwODZEBQ1VSs43en1o5IT/Z/79UC6wAKg+Z4VnkdcK0b9EsW9VQU
oIfVXZjmm5CWPMiV5f9gG2t36j2wydpDryYqEAE+n8N76JzD/ZKlmHo+FJBJNsSx
Hcoq3VRgR5v53BTLFZLLBaqLIqnQAUwn/RcWlEbS3dEGQDvKglNjwmSVf6Myub5w
gnr0OSIDwEL31l+12DbAQ9+ANv6TLpWNfLpX0E6IStkZAgMBAAE=
-----END PUBLIC KEY-----`;
    expect(formatPublicKey(key)).toHaveLength(35);
    expect(formatPublicKey(key)).toContain(' ... ');
  });
});
describe('formatTime function', () => {
  it('works as expected', async () => {
    expect(formatTime(new Date('2020-11-30T18:36:38.258Z'))).toEqual('2020-11-30T18:36:38.258');
    expect(formatTime('2020-11-30 18 : 36 : 38 . 258 UTC')).toEqual('2020-11-30T18:36:38.258');
  });
});
describe('fullyDecodeURI function', () => {
  it('works as expected', async () => {
    expect(fullyDecodeURI('http%3A%2F%2Ftest%20encoded%20%2520http%253A%252F%252Ftest%20%2520%20twice%20%C3%B8%C3%A6%C3%A5%C3%9F%2F%60%C2%B4')).toEqual(
      'http://test encoded  http://test   twice øæåß/`´'
    );
  });
});
describe('getDemoDeviceAddress function', () => {
  it('works as expected', async () => {
    expect(getDemoDeviceAddress(Object.values(defaultState.devices.byId), 'virtual', 85)).toEqual('http://localhost:85');
    expect(getDemoDeviceAddress(Object.values(defaultState.devices.byId), 'physical', 85)).toEqual('http://192.168.10.141:85');
  });
});
describe('preformatWithRequestID function', () => {
  it('works as expected', async () => {
    expect(preformatWithRequestID({ data: { request_id: 'someUuidLikeLongerText' } }, token)).toEqual(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTNkMGY4Yy1hZWRlLTQwMzAtYjM5MS03ZDUwMjBlYjg3M2UiLCJzdWIiOiJhMzBhNzgwYi1iODQzLTUzNDQtODBlMy0wZmQ5NWE0ZjZmYzMiLCJleHAiOjE2MDY4MTUzNjksImlhdCI6MTYwNjIxMDU2OSwibWVuZGVyLnRlbmF... [Request ID: someUuid]'
    );
    expect(preformatWithRequestID({ data: {} }, token)).toEqual(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTNkMGY4Yy1hZWRlLTQwMzAtYjM5MS03ZDUwMjBlYjg3M2UiLCJzdWIiOiJhMzBhNzgwYi1iODQzLTUzNDQtODBlMy0wZmQ5NWE0ZjZmYzMiLCJleHAiOjE2MDY4MTUzNjksImlhdCI6MTYwNjIxMDU2OSwibWVuZGVyLnRlbmF...'
    );
    expect(preformatWithRequestID(undefined, token)).toEqual(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTNkMGY4Yy1hZWRlLTQwMzAtYjM5MS03ZDUwMjBlYjg3M2UiLCJzdWIiOiJhMzBhNzgwYi1iODQzLTUzNDQtODBlMy0wZmQ5NWE0ZjZmYzMiLCJleHAiOjE2MDY4MTUzNjksImlhdCI6MTYwNjIxMDU2OSwibWVuZGVyLnRlbmF...'
    );
    expect(preformatWithRequestID({ data: { request_id: 'someUuidLikeLongerText' } }, 'short text')).toEqual('short text [Request ID: someUuid]');
    expect(preformatWithRequestID(undefined, 'short text')).toEqual('short text');
  });
});
describe('statusToPercentage function', () => {
  it('should not crash for improper values', async () => {
    ['0', 0, null, undefined, this].map(state =>
      [0, 42, 100, undefined, null].map(returnValue => {
        const result = statusToPercentage(state, returnValue);
        return expect(typeof result).toBe('number');
      })
    );
  });
  it('always results in 100% for finished states', async () => {
    ['aborted', 'already-installed', 'failure', 'success'].map(state => {
      return [0, 42, 100, undefined, null].map(returnValue => expect(statusToPercentage(state, returnValue)).toEqual(100));
    });
  });
  it('always results in 0% for not started states', async () => {
    ['pending', 'noartifact'].map(state => {
      return [0, 42, 100, undefined, null].map(returnValue => expect(statusToPercentage(state, returnValue)).toEqual(0));
    });
  });
  it('always results in 70% when installing', async () => {
    ['installing'].map(state => {
      return [0, 42, 100, undefined, null].map(returnValue => expect(statusToPercentage(state, returnValue)).toEqual(70));
    });
  });
  it('returns slightly increased percentage while downloading', async () => {
    const state = 'downloading';
    expect(statusToPercentage(state, 0)).toEqual(0);
    expect(statusToPercentage(state, 1)).toEqual(1);
    expect(statusToPercentage(state, 42)).toEqual(42);
    expect(statusToPercentage(state, 100)).toEqual(69);
    expect(statusToPercentage(state, undefined)).toEqual(69);
    expect(statusToPercentage(state, null)).toEqual(0);
  });
  it('returns slightly increased percentage while rebooting', async () => {
    const state = 'rebooting';
    expect(statusToPercentage(state, 0)).toEqual(75);
    expect(statusToPercentage(state, 1)).toEqual(76);
    expect(statusToPercentage(state, 42)).toEqual(99);
    expect(statusToPercentage(state, 100)).toEqual(99);
    expect(statusToPercentage(state, undefined)).toEqual(99);
    expect(statusToPercentage(state, null)).toEqual(75);
  });
});

describe('extractSoftware function', () => {
  it('works as expected', async () => {
    expect(
      extractSoftware({
        artifact_name: 'myapp',
        'rootfs-image.version': 'stablev1-beta-final-v0',
        'rootfs-image.checksum': '12341143',
        'test.version': 'test-2',
        'a.whole.lot.of.dots.version': 'test-3'
      })
    ).toEqual(['rootfs-image', 'test', 'a']);
  });
});

describe('extractSoftwareInformation function', () => {
  it('works as expected', async () => {
    expect(
      extractSoftwareInformation(defaultState.releases.byId.a1.Artifacts[0].artifact_provides, undefined, [
        'Software filesystem',
        'Software name',
        'Software version'
      ])
    ).toEqual({
      'data-partition': [
        { primary: 'Software filesystem', priority: 0, secondary: 'data-partition' },
        { primary: 'Software name', priority: 1, secondary: 'myapp' },
        { primary: 'Software version', priority: 2, secondary: 'v2020.10' }
      ]
    });
    expect(extractSoftwareInformation(defaultState.devices.byId.a1.attributes)).toEqual({});
    expect(
      extractSoftwareInformation({
        artifact_name: 'myapp',
        'rootfs-image.version': 'stablev1-beta-final-v0',
        'rootfs-image.checksum': '12341143',
        'test.version': 'test-2',
        'a.whole.lot.of.dots.version': 'test-3',
        'a.whole.lot.of.dots.more': 'test-4',
        'even.more.dots.than.before.version': 'test-5',
        'even.more.dots.than.before.more': 'test-6'
      })
    ).toEqual({
      a: [
        { primary: 'artifact_name', priority: 2, secondary: 'myapp' },
        { primary: 'whole', priority: 6, secondary: 'test-3' },
        { primary: 'whole', priority: 7, secondary: 'test-4' }
      ],
      even: [
        { primary: 'more', priority: 8, secondary: 'test-5' },
        { primary: 'more', priority: 9, secondary: 'test-6' }
      ],
      'rootfs-image': [
        { primary: 'System filesystem', priority: 0, secondary: 'stablev1-beta-final-v0' },
        { primary: 'checksum', priority: 1, secondary: '12341143' }
      ],
      test: [{ primary: 'test.version', priority: 3, secondary: 'test-2' }]
    });
  });
});

describe('generateDeploymentGroupDetails function', () => {
  it('works as expected', async () => {
    expect(generateDeploymentGroupDetails({ terms: defaultState.devices.groups.byId.testGroupDynamic.filters }, 'testGroupDynamic')).toEqual(
      'testGroupDynamic (group = things)'
    );
    expect(
      generateDeploymentGroupDetails(
        {
          terms: [
            { scope: 'system', key: 'group', operator: '$eq', value: 'things' },
            { scope: 'system', key: 'group', operator: '$nexists', value: 'otherThings' },
            { scope: 'system', key: 'group', operator: '$nin', value: 'a,small,list' }
          ]
        },
        'testGroupDynamic'
      )
    ).toEqual(`testGroupDynamic (group = things, group doesn't exist otherThings, group not in a,small,list)`);
    expect(generateDeploymentGroupDetails({ terms: undefined }, 'testGroupDynamic')).toEqual('testGroupDynamic');
  });
});

describe('standardizePhases function', () => {
  it('works as expected', async () => {
    const phases = [
      { batch_size: 10, delay: 2, delayUnit: 'hours', start_ts: '2019-01-01T12:30:00.000Z' },
      { batch_size: 10, delay: 2, start_ts: '2019-01-01T12:30:00.000Z' },
      { batch_size: 10, start_ts: '2019-01-01T12:30:00.000Z' }
    ];
    expect(standardizePhases(phases)).toEqual([
      { batch_size: 10, delay: 2, delayUnit: 'hours' },
      { batch_size: 10, delay: 2, delayUnit: 'hours', start_ts: 1 },
      { batch_size: 10, start_ts: 2 }
    ]);
  });
});

describe('getRemainderPercent function', () => {
  const phases = [
    { batch_size: 10, not: 'interested' },
    { batch_size: 10, not: 'interested' },
    { batch_size: 10, not: 'interested' }
  ];
  expect(getRemainderPercent(phases)).toEqual(80);
  expect(
    getRemainderPercent([
      { batch_size: 10, not: 'interested' },
      { batch_size: 90, not: 'interested' }
    ])
  ).toEqual(90);
  expect(
    getRemainderPercent([
      { batch_size: 10, not: 'interested' },
      { batch_size: 95, not: 'interested' }
    ])
  ).toEqual(90);
  // this will be caught in the phase validation - should still be good to be fixed in the future
  expect(
    getRemainderPercent([
      { batch_size: 50, not: 'interested' },
      { batch_size: 55, not: 'interested' },
      { batch_size: 95, not: 'interested' }
    ])
  ).toEqual(-5);
});

describe('validatePhases function', () => {
  it('works as expected', async () => {
    const phases = [
      { batch_size: 10, delay: 2, delayUnit: 'hours', start_ts: '2019-01-01T12:30:00.000Z' },
      { batch_size: 10, delay: 2, start_ts: '2019-01-01T12:30:00.000Z' },
      { batch_size: 10, start_ts: '2019-01-01T12:30:00.000Z' }
    ];
    expect(validatePhases(undefined, 10000, false)).toEqual(true);
    expect(validatePhases(undefined, 10000, true)).toEqual(true);
    expect(validatePhases(phases, 10, true)).toEqual(true);
    expect(validatePhases(phases, 10, true)).toEqual(true);
    expect(
      validatePhases(
        [
          { batch_size: 50, not: 'interested' },
          { batch_size: 55, not: 'interested' },
          { batch_size: 95, not: 'interested' }
        ],
        10,
        false
      )
    ).toEqual(false);
    expect(
      validatePhases(
        [
          { batch_size: 50, not: 'interested' },
          { batch_size: 55, not: 'interested' },
          { batch_size: 95, not: 'interested' }
        ],
        100,
        true
      )
    ).toEqual(true);
  });
});

describe('tryMapDeployments function', () => {
  it('works as expected', async () => {
    expect(Object.keys(defaultState.deployments.byId).reduce(tryMapDeployments, { state: { ...defaultState }, deployments: [] }).deployments).toEqual(
      Object.values(defaultState.deployments.byId)
    );
    expect(['unknownDeploymentId'].reduce(tryMapDeployments, { state: { ...defaultState }, deployments: [] }).deployments).toEqual([]);
  });
});
