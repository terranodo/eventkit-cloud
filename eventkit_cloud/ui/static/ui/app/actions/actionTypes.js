const types = {
    LOAD_RUNS_SUCCESS: 'LOAD_JOBS_SUCCESS',
    UPDATE_AOI_INFO: 'UPDATE_AOI_INFO',
    CLEAR_AOI_INFO: 'CLEAR_AOI_INFO',
    UPDATE_EXPORT_INFO: 'UPDATE_EXPORT_INFO',
    CLEAR_EXPORT_INFO: 'CLEAR_EXPORT_INFO',
    DRAW_SEARCH_BBOX: 'DRAW_SEARCH_BBOX',
    CLEAR_SEARCH_BBOX: 'CLEAR_SEARCH_BBOX',
    FETCHING_GEOCODE: 'FETCHING_GEOCODE',
    RECEIVED_GEOCODE: 'RECEIVED_GEOCODE',
    FETCH_GEOCODE_ERROR: 'FETCH_GEOCODE_ERROR',
    USER_LOGGING_IN: 'USER_LOGGING_IN',
    USER_LOGGED_IN: 'USER_LOGGED_IN',
    USER_LOGGED_OUT: 'USER_LOGGED_OUT',
    PATCHING_USER: 'PATCHING_USER',
    PATCHED_USER: 'PATCHED_USER',
    PATCHING_USER_ERROR: 'PATCHING_USER_ERROR',
    CLOSING_DRAWER: 'CLOSING_DRAWER',
    CLOSED_DRAWER: 'CLOSED_DRAWER',
    OPENING_DRAWER: 'OPENING_DRAWER',
    OPENED_DRAWER: 'OPENED_DRAWER',
    FETCHING_RUNS: 'FETCHING_RUNS',
    RECEIVED_RUNS: 'RECEIVED_RUNS',
    FETCH_RUNS_ERROR: 'FETCH_RUNS_ERROR',
    GETTING_PROVIDERS: 'GETTING_PROVIDERS',
    PROVIDERS_RECEIVED: 'PROVIDERS_RECEIVED',
    MAKE_STEPPER_ACTIVE: 'MAKE_STEPPER_ACTIVE',
    MAKE_STEPPER_INACTIVE: 'MAKE_STEPPER_INACTIVE',
    LOAD_JOBS_SUCCESS: 'LOAD_JOBS_SUCCESS',
    SET_TOKEN: 'SET_TOKEN',
    CLEAR_TOKEN: 'CLEAR_TOKEN',
    DELETING_RUN: 'DELETING_RUN',
    DELETED_RUN: 'DELETED_RUN',
    DELETE_RUN_ERROR: 'DELETE_RUN_ERROR',
    SUBMITTING_JOB: 'SUBMITTING_JOB',
    JOB_SUBMITTED_SUCCESS: 'JOB_SUBMITTED_SUCCESS',
    JOB_SUBMITTED_ERROR: 'JOB_SUBMITTED_ERROR',
    GETTING_DATACART_DETAILS: 'GETTING_DATACART_DETAILS',
    DATACART_DETAILS_RECEIVED: 'DATACART_DETAILS_RECEIVED',
    DATACART_DETAILS_RECEIVED_FLAG: 'DATACART_DETAILS_RECEIVED_FLAG',
    DATACART_DETAILS_ERROR: 'DATACART_DETAILS_ERROR',
    CLEAR_JOB_INFO: 'CLEAR_JOB_INFO',
    RERUNNING_EXPORT: 'RERUNNING_EXPORT',
    RERUN_EXPORT_ERROR: 'RERUN_EXPORT_ERROR',
    RERUN_EXPORT_SUCCESS: 'RERUN_EXPORT_SUCCESS',
    CLEAR_RERUN_INFO: 'CLEAR_RERUN_INFO',
    FETCHING_LICENSES: 'FETCHING_LICENSES',
    RECEIVED_LICENSES: 'RECEIVED_LICENSES',
    FETCH_LICENSES_ERROR: 'FETCH_LICENSES_ERROR',
    CANCELING_PROVIDER_TASK: 'CANCELING_PROVIDER_TASK',
    CANCELED_PROVIDER_TASK: 'CANCELED_PROVIDER_TASK',
    CANCEL_PROVIDER_TASK_ERROR: 'CANCEL_PROVIDER_TASK_ERROR',
    UPDATING_EXPIRATION: 'UPDATING_EXPIRATION',
    UPDATE_EXPIRATION_ERROR: 'UPDATE_EXPIRATION_ERROR',
    UPDATE_EXPIRATION_SUCCESS: 'UPDATE_EXPIRATION_SUCCESS',
    UPDATING_PERMISSION: 'UPDATING_PERMISSION',
    UPDATE_PERMISSION_ERROR: 'UPDATE_PERMISSION_ERROR',
    UPDATE_PERMISSION_SUCCESS: 'UPDATE_PERMISSION_SUCCESS',
    GETTING_FORMATS: 'GETTING_FORMATS',
    FORMATS_RECEIVED: 'FORMATS_RECEIVED',
    SET_PAGE_ORDER: 'SET_PAGE_ORDER',
    SET_PAGE_VIEW: 'SET_PAGE_VIEW',
    USER_ACTIVE: 'USER_ACTIVE',
    FETCHING_GROUPS: 'FETCHING_GROUPS',
    FETCHED_GROUPS: 'FETCHED_GROUPS',
    FETCH_GROUPS_ERROR: 'FETCH_GROUPS_ERROR',
    DELETING_GROUP: 'DELETING_GROUP',
    DELETED_GROUP: 'DELETED_GROUP',
    DELETE_GROUP_ERROR: 'DELETE_GROUP_ERROR',
    CREATING_GROUP: 'CREATING_GROUP',
    CREATED_GROUP: 'CREATED_GROUP',
    CREATE_GROUP_ERROR: 'CREATE_GROUP_ERROR',
    ADDING_GROUP_USERS: 'ADDING_GROUP_USERS',
    ADDED_GROUP_USERS: 'ADDED_GROUP_USERS',
    ADDING_GROUP_USERS_ERROR: 'ADDING_GROUP_USERS_ERROR',
    REMOVING_GROUP_USERS: 'REMOVING_GROUP_USERS',
    REMOVED_GROUP_USERS: 'REMOVED_GROUP_USERS',
    REMOVING_GROUP_USERS_ERROR: 'REMOVING_GROUP_USERS_ERROR',
    FETCHING_USERS: 'FETCHING_USERS',
    FETCHED_USERS: 'FETCHED_USERS',
    FETCH_USERS_ERROR: 'FETCH_USERS_ERROR',
};

export default types;

