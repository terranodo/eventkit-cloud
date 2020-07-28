import * as actions from '../../actions/groupActions';

describe('userGroups actions', () => {
    describe('getGroups action', () => {
        it('should return the correct types', () => {
            expect(actions.getGroups().types).toEqual([
                actions.types.FETCHING_GROUPS,
                actions.types.FETCHED_GROUPS,
                actions.types.FETCH_GROUPS_ERROR,
            ]);
        });

        it('getCancelSource should return the source', () => {
            const state = { groups: { cancelSource: 'test' } };
            expect(actions.getGroups().getCancelSource(state)).toEqual('test');
        });

        it('onSuccess should return groups', () => {
            const ret = { data: ['groupOne', 'groupTwo'], headers: { 'total-groups': '12', 'admin-groups': '12', 'shared-groups': '12', 'other-groups': '12'} };
            expect(actions.getGroups().onSuccess(ret)).toEqual({
                groups: ret.data,
                nextPage: false,
                range: '',
                total: 12,
                totalAdmin: 12,
                totalMember: 12,
                totalOther: 12,
            });
        });

        it('onSuccess should return group that has permission_level "admin"', () => {
            const ret = {
                data: [{
                    id: 1213,
                    name: 'GroupA',
                    administrators: 'admin',
                    members: 'admin',
                    restricted: false,
                }],
                headers: {
                    'total-groups': '12',
                },
            };
            const params = {
                page_size: 1,
                page: 1,
                permission_level: 'admin',
                user: 'admin',
            };
            expect(actions.getGroups(params).params).toEqual(params);
            expect(actions.getGroups().onSuccess(ret)).toEqual({
                groups: ret.data,
                nextPage: false,
                range: '',
                total: 12,
            });
        });
    });

    describe('deleteGroup action', () => {
        it('should return the correct types', () => {
            expect(actions.deleteGroup().types).toEqual([
                actions.types.DELETING_GROUP,
                actions.types.DELETED_GROUP,
                actions.types.DELETE_GROUP_ERROR,
            ]);
        });
    });

    describe('createGroup action', () => {
        it('should return the correct types', () => {
            expect(actions.createGroup().types).toEqual([
                actions.types.CREATING_GROUP,
                actions.types.CREATED_GROUP,
                actions.types.CREATE_GROUP_ERROR,
            ]);
        });

        it('should return the correct data', () => {
            const name = 'test name';
            const members = ['one', 'two'];
            const expected = { name, members };
            expect(actions.createGroup(name, members).data).toEqual(expected);
        });
    });

    describe('updateGroup action', () => {
        it('should return the correct types', () => {
            expect(actions.updateGroup().types).toEqual([
                actions.types.UPDATING_GROUP,
                actions.types.UPDATED_GROUP,
                actions.types.UPDATING_GROUP_ERROR,
            ]);
        });

        it('should return the correct data', () => {
            const opt = { name: 'test name', members: ['one'], administrators: ['two'] };
            expect(actions.updateGroup('', opt).data).toEqual(opt);
        });
    });
});
