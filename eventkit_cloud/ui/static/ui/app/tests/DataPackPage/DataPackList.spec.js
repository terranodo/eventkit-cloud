import React from 'react';
import sinon from 'sinon';
import {shallow, mount} from 'enzyme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow} from 'material-ui/Table';
import {GridList} from 'material-ui/GridList'
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import NavigationArrowDropUp from 'material-ui/svg-icons/navigation/arrow-drop-up';
import DataPackList from '../../components/DataPackPage/DataPackList';
import DataPackListItem from '../../components/DataPackPage/DataPackListItem';
import DataPackTableItem from '../../components/DataPackPage/DataPackTableItem';
import CustomScrollbar from '../../components/CustomScrollbar';

describe('DataPackList component', () => {
    injectTapEventPlugin();
    const muiTheme = getMuiTheme();
    const getProps = () => {
        return {
            runs: getRuns(),
            user: {data: {user: {username: 'admin'}}},
            onRunDelete: () => {},
            onSort: () => {},
            order: '-started_at'
        }
    }

    it('should render list items as part of the mobile view', () => {
        const props = getProps();
        const wrapper = mount(<DataPackList {...props}/>, {
            context: {muiTheme},
            childContextTypes: {muiTheme: React.PropTypes.object}
        });
        // ensure the screen is small
        window.resizeTo(556, 600);
        expect(window.innerWidth).toEqual(556);
        wrapper.update();

        expect(wrapper.find(GridList)).toHaveLength(1);
        expect(wrapper.find(DataPackListItem)).toHaveLength(3);
        expect(wrapper.find(Table)).toHaveLength(0);
    });

    it('should render table items as part of the desktop view', () => {
        const props = getProps();
        const  wrapper = mount(<DataPackList {...props}/>, {
            context: {muiTheme},
            childContextTypes: {muiTheme: React.PropTypes.object}
        });
        //ensure the screen is large
        window.resizeTo(1250, 800);
        expect(window.innerWidth).toEqual(1250);
        wrapper.update();

        expect(wrapper.find(GridList)).toHaveLength(0);
        expect(wrapper.find(Table)).toHaveLength(2);
        expect(wrapper.find(CustomScrollbar)).toHaveLength(1);
        expect(wrapper.find(TableHeader)).toHaveLength(1);
        expect(wrapper.find(TableHeaderColumn)).toHaveLength(7);
        const headerColumns = wrapper.find(TableHeaderColumn);
        expect(headerColumns.at(0).text()).toEqual('Name');
        expect(headerColumns.at(0).find(NavigationArrowDropDown)).toHaveLength(1);
        expect(headerColumns.at(1).text()).toEqual('Event');
        expect(headerColumns.at(1).find(NavigationArrowDropDown)).toHaveLength(1);
        expect(headerColumns.at(2).text()).toEqual('Date Added');
        expect(headerColumns.at(2).find(NavigationArrowDropDown)).toHaveLength(1);
        expect(headerColumns.at(3).text()).toEqual('Status');
        expect(headerColumns.at(3).find(NavigationArrowDropDown)).toHaveLength(1);
        expect(headerColumns.at(4).text()).toEqual('Permissions');
        expect(headerColumns.at(4).find(NavigationArrowDropDown)).toHaveLength(1);
        expect(headerColumns.at(5).text()).toEqual('Owner');
        expect(headerColumns.at(5).find(NavigationArrowDropDown)).toHaveLength(1);
        expect(headerColumns.at(6).text()).toEqual('');
        expect(wrapper.find(TableBody)).toHaveLength(1);
        expect(wrapper.find(DataPackTableItem)).toHaveLength(3);
    });

    it('should have order newest date active by default in the table', () => {
        const props = getProps();
        const wrapper = mount(<DataPackList {...props}/>, {
            context: {muiTheme},
            childContextTypes: {muiTheme: React.PropTypes.object}
        });
        //ensure the screen is large
        window.resizeTo(1250, 800);
        expect(window.innerWidth).toEqual(1250);
        wrapper.update();
        expect(wrapper.find(TableHeaderColumn).at(2).find('span').props().style).toEqual({color: '#000', fontWeight: 'bold'});
        expect(wrapper.state().order).toEqual('-started_at');
    });

    it('handleOrder should call isSameOrderType and props.onSort', () => {
        let props = getProps();
        props.onSort = new sinon.spy();
        const isSameSpy = new sinon.spy(DataPackList.prototype, 'isSameOrderType');
        let newOrder = 'job__name';
        const wrapper = mount(<DataPackList {...props}/>, {
            context: {muiTheme},
            childContextTypes: {muiTheme: React.PropTypes.object}
        });
        wrapper.instance().handleOrder(newOrder);
        expect(isSameSpy.calledWith('-started_at', 'job__name')).toBe(true);
        expect(props.onSort.calledOnce).toBe(true);
        expect(props.onSort.calledWith(newOrder)).toBe(true);
        newOrder = 'started_at';
        wrapper.instance().handleOrder(newOrder);
        expect(isSameSpy.calledWith('-started_at', 'started_at')).toBe(true);
        expect(props.onSort.calledTwice).toBe(true);
        expect(props.onSort.calledWith(newOrder)).toBe(true);
    });

    it('isSameOrderType should return true or false', () => {
        const props = getProps();
        const wrapper = shallow(<DataPackList {...props}/>);
        expect(wrapper.instance().isSameOrderType('-started_at', 'started_at')).toBe(true);
        expect(wrapper.instance().isSameOrderType('job__name', 'started_at')).toBe(false);
    });

    it('getIcon should return up arrow if activeSort is equal to passed in sort, else it return down arrow', () => {
        const props = getProps();
        const wrapper = shallow(<DataPackList {...props}/>);
        let icon = wrapper.instance().getIcon('started_at');
        expect(icon).toEqual(<NavigationArrowDropDown style={{verticalAlign: 'middle', marginBottom: '2px', fill: '#4498c0'}}/>);
        icon = wrapper.instance().getIcon('-started_at');
        expect(icon).toEqual(<NavigationArrowDropUp style={{verticalAlign: 'middle', marginBottom: '2px', fill: '#4498c0'}}/>);
    });

    it('getHeaderStyle should return bold black style if true or inherit style if false', () => {
        const props = getProps();
        const wrapper = shallow(<DataPackList {...props}/>);
        let style = wrapper.instance().getHeaderStyle(true);
        expect(style).toEqual({color: '#000', fontWeight: 'bold'});
        style = wrapper.instance().getHeaderStyle(false);
        expect(style).toEqual({color: 'inherit'});
    });
});

function getRuns() {
    return [
    {
        "uid": "6870234f-d876-467c-a332-65fdf0399a0d",
        "url": "http://cloud.eventkit.dev/api/runs/6870234f-d876-467c-a332-65fdf0399a0d",
        "started_at": "2017-03-10T15:52:35.637331Z",
        "finished_at": "2017-03-10T15:52:39.837Z",
        "duration": "0:00:04.199825",
        "user": "admin",
        "status": "COMPLETED",
        "job": {
            "uid": "7643f806-1484-4446-b498-7ddaa65d011a",
            "name": "Test1",
            "event": "Test1 event",
            "description": "Test1 description",
            "url": "http://cloud.eventkit.dev/api/jobs/7643f806-1484-4446-b498-7ddaa65d011a",
            "extent": {
                "type": "Feature",
                "properties": {
                    "uid": "7643f806-1484-4446-b498-7ddaa65d011a",
                    "name": "Test1"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -0.077419,
                                50.778155
                            ],
                            [
                                -0.077419,
                                50.818517
                            ],
                            [
                                -0.037251,
                                50.818517
                            ],
                            [
                                -0.037251,
                                50.778155
                            ],
                            [
                                -0.077419,
                                50.778155
                            ]
                        ]
                    ]
                }
            },
            "selection": "",
            "published": false
        },
        "provider_tasks": [],
        "zipfile_url": "http://cloud.eventkit.dev/downloads/6870234f-d876-467c-a332-65fdf0399a0d/TestGPKG-WMTS-TestProject-eventkit-20170310.zip",
        "expiration": "2017-03-24T15:52:35.637258Z"
    },
    {
        "uid": "c7466114-8c0c-4160-8383-351414b11e37",
        "url": "http://cloud.eventkit.dev/api/runs/c7466114-8c0c-4160-8383-351414b11e37",
        "started_at": "2017-03-10T15:52:29.311523Z",
        "finished_at": "2017-03-10T15:52:33.612Z",
        "duration": "0:00:04.301278",
        "user": "notAdmin",
        "status": "COMPLETED",
        "job": {
            "uid": "5488a864-89f2-4e9c-8370-18291ecdae4a",
            "name": "Test2",
            "event": "Test2 event",
            "description": "Test2 description",
            "url": "http://cloud.eventkit.dev/api/jobs/5488a864-89f2-4e9c-8370-18291ecdae4a",
            "extent": {
                "type": "Feature",
                "properties": {
                    "uid": "5488a864-89f2-4e9c-8370-18291ecdae4a",
                    "name": "Test2"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -0.077419,
                                50.778155
                            ],
                            [
                                -0.077419,
                                50.818517
                            ],
                            [
                                -0.037251,
                                50.818517
                            ],
                            [
                                -0.037251,
                                50.778155
                            ],
                            [
                                -0.077419,
                                50.778155
                            ]
                        ]
                    ]
                }
            },
            "selection": "",
            "published": true
        },
        "provider_tasks": [],
        "zipfile_url": "http://cloud.eventkit.dev/downloads/c7466114-8c0c-4160-8383-351414b11e37/TestGPKG-WMS-TestProject-eventkit-20170310.zip",
        "expiration": "2017-03-24T15:52:29.311458Z"
    },
    {
        "uid": "282816a6-7d16-4f59-a1a9-18764c6339d6",
        "url": "http://cloud.eventkit.dev/api/runs/282816a6-7d16-4f59-a1a9-18764c6339d6",
        "started_at": "2017-03-10T15:52:18.796929Z",
        "finished_at": "2017-03-10T15:52:27.500Z",
        "duration": "0:00:08.703092",
        "user": "admin",
        "status": "COMPLETED",
        "job": {
            "uid": "78bbd59a-4066-4e30-8460-c7b0093a0d7a",
            "name": "Test3",
            "event": "Test3 event",
            "description": "Test3 description",
            "url": "http://cloud.eventkit.dev/api/jobs/78bbd59a-4066-4e30-8460-c7b0093a0d7a",
            "extent": {
                "type": "Feature",
                "properties": {
                    "uid": "78bbd59a-4066-4e30-8460-c7b0093a0d7a",
                    "name": "Test3"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -0.077419,
                                50.778155
                            ],
                            [
                                -0.077419,
                                50.818517
                            ],
                            [
                                -0.037251,
                                50.818517
                            ],
                            [
                                -0.037251,
                                50.778155
                            ],
                            [
                                -0.077419,
                                50.778155
                            ]
                        ]
                    ]
                }
            },
            "selection": "",
            "published": true
        },
        "provider_tasks": [],
        "zipfile_url": "http://cloud.eventkit.dev/downloads/282816a6-7d16-4f59-a1a9-18764c6339d6/TestGPKG-OSM-CLIP-TestProject-eventkit-20170310.zip",
        "expiration": "2017-03-24T15:52:18.796854Z"
    },]
}
