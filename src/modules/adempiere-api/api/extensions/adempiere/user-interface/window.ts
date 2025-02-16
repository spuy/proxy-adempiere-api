/************************************************************************************
 * Copyright (C) 2012-2023 E.R.P. Consultores y Asociados, C.A.                     *
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com                     *
 * This program is free software: you can redistribute it and/or modify             *
 * it under the terms of the GNU General Public License as published by             *
 * the Free Software Foundation, either version 2 of the License, or                *
 * (at your option) any later version.                                              *
 * This program is distributed in the hope that it will be useful,                  *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                   *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                     *
 * GNU General Public License for more details.                                     *
 * You should have received a copy of the GNU General Public License                *
 * along with this program. If not, see <https://www.gnu.org/licenses/>.            *
 ************************************************************************************/

import { Router } from 'express';
import { ExtensionAPIFunctionParameter } from '@storefront-api/lib/module';

import {
  getRecordReferenceInfoFromGRPC
} from '@adempiere/grpc-api/src/utils/baseDataTypeFromGRPC.js';
import {
  getLookupItemFromGRPC
} from '@adempiere/grpc-api/src/utils/userInterfaceFromGRPC';

import {
  convertAttributes,
  convertEntityFromGRPC
} from '@adempiere/grpc-api/lib/convertBaseDataType';
import {
  convertCalloutFromGRPC
} from '@adempiere/grpc-api/lib/convertBusinessData';

module.exports = ({ config }: ExtensionAPIFunctionParameter) => {
  const api = Router();
  const ServiceApi = require('@adempiere/grpc-api');
  const service = new ServiceApi(config);

  /**
   * GET Context Information Value
   *
   * req.query.token - user token
   * req.query.uuid - uuid of record
   * req.query.query - query for search
   *
   * Details:
   */
  api.get('/context-info-value', (req, res) => {
    if (req.query) {
      service.getContextInfoValue({
        token: req.headers.authorization,
        query: req.query.query,
        uuid: req.query.uuid,
        id: req.query.id
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: {
              message_text: response.getMessageText(),
              message_tip: response.getMessageTip()
            }
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * GET References
   *
   * req.query.token - user token
   * req.query.page_size - page token
   * req.query.page_token - page size
   * req.query.table_name - table name (Mandatory if is not a query)
   * req.query.window_uuid - uuid of window
   * req.query.id - id reference
   * req.query.uuid - uuid reference
   *
   * Details:
   */
  api.get('/references', (req, res) => {
    if (req.query) {
      service.listReferences({
        token: req.headers.authorization,
        tableName: req.query.table_name,
        windowUuid: req.query.window_uuid,
        id: req.query.id,
        uuid: req.query.uuid,
        pageSize: req.query.page_size,
        pageToken: req.query.page_token
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: {
              record_count: response.getRecordCount(),
              next_page_token: response.getNextPageToken(),
              records: response.getReferencesList().map(reference => {
                return getRecordReferenceInfoFromGRPC(reference)
              })
            }
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * GET Exists References on Record
   *
   * req.query.token - user token
   * req.query.record_id - id of entity
   * req.query.record_uuid - uuid of entity
   * req.query.tab_id - tab of entity
   * req.query.tab_uuid - tab of entity
   */
  api.get('/exists-references', (req, res) => {
    if (req.query) {
      const ServiceApi = require('@adempiere/grpc-api/src/services/userInterface');
      const service = new ServiceApi(config);

      service.existsReferences({
        token: req.headers.authorization,
        // record information
        tabId: req.query.tab_id,
        tabUuid: req.query.tab_uuid,
        recordId: req.query.record_id,
        recordUuid: req.query.record_uuid
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: response.getRecordCount()
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * GET Lookup Items
   *
   * req.query.token - user token
   * req.query.page_size - size of page (customized)
   * req.query.page_token - token of page (optional for get a specific page)
   * req.query.table_name - table name (Mandatory if is not a query)
   * req.query.process_parameter_uuid - when ius called from process
   * req.query.field_uuid - when ius called from window
   * req.query.browse_field_uuid - when ius called from browser
   * req.query.reference_uuid - when ius called from reference only
   * req.query.column_uuid - when ius called from column uuid
   * req.query.column_name - when ius called from column name only
   * req.query.search_value - search value optional
   * req.query.context_attributes - attributes
   * "context_attributes": [
      {
        "key": "AD_Client_ID",
        "value": 1000000
      },
      {
        "key": "AD_Org_ID",
        "value": 1000000
      },
      {
        "key": "Created",
        "value": "2020-10-13T16:14:23.000Z"
      },
      {
        "key": "CreatedBy",
        "value": 1000017
      },
      {
        "key": "IsActive",
        "value": true
      },
      {
        "key": "Value",
        "value": "Solo Pruebas"
      }
    ]
   * Details:
   */
  api.get('/lookup-items', (req, res) => {
    if (req.query) {
      service.listLookupItems({
        token: req.headers.authorization,
        //  Running parameters
        tableName: req.query.table_name,
        processParameterUuid: req.query.process_parameter_uuid,
        fieldUuid: req.query.field_uuid,
        browseFieldUuid: req.query.browse_field_uuid,
        referenceUuid: req.query.reference_uuid,
        columnUuid: req.query.column_uuid,
        columnName: req.query.column_name,
        searchValue: req.query.search_value,
        contextAttributes: req.query.context_attributes,
        //  Page Data
        pageSize: req.query.page_size,
        pageToken: req.query.page_token
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: {
              record_count: response.getRecordCount(),
              next_page_token: response.getNextPageToken(),
              records: response.getRecordsList().map(lookupItem => {
                return getLookupItemFromGRPC(lookupItem);
              })
            }
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * GET Lookup Item
   *
   * req.query.token - user token
   * req.query.id - record id
   * req.query.uuid - uuid
   * req.query.table_name - table name (Mandatory if is not a query)
   * req.query.process_parameter_uuid - when ius called from process
   * req.query.field_uuid - when ius called from window
   * req.query.browse_field_uuid - when ius called from browser
   * req.query.reference_uuid - when ius called from reference only
   * req.query.column_uuid - when ius called from column uuid
   * req.query.column_name - when ius called from column name only
   * req.query.context_attributes - attributes
   * "context_attributes": [
      {
        "key": "AD_Client_ID",
        "value": 1000000
      },
      {
        "key": "AD_Org_ID",
        "value": 1000000
      },
      {
        "key": "Created",
        "value": "2020-10-13T16:14:23.000Z"
      },
      {
        "key": "CreatedBy",
        "value": 1000017
      },
      {
        "key": "IsActive",
        "value": true
      },
      {
        "key": "Value",
        "value": "Solo Pruebas"
      }
    ]
   * Details:
   */
  api.get('/lookup-item', (req, res) => {
    if (req.query) {
      service.getLookupItem({
        token: req.headers.authorization,
        //  Running parameters
        tableName: req.query.table_name,
        processParameterUuid: req.query.process_parameter_uuid,
        fieldUuid: req.query.field_uuid,
        browseFieldUuid: req.query.browse_field_uuid,
        referenceUuid: req.query.reference_uuid,
        columnUuid: req.query.column_uuid,
        columnName: req.query.column_name,
        contextAttributes: req.query.context_attributes,
        id: req.query.id,
        uuid: req.query.uuid
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: getLookupItemFromGRPC(response)
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * GET Default Value
   *
   * req.query.token - user token
   * req.query.process_parameter_uuid - when ius called from process
   * req.query.field_uuid - when ius called from window
   * req.query.browse_field_uuid - when ius called from browser
   * req.query.reference_uuid - when ius called from reference only
   * req.query.column_uuid - when ius called from column uuid
   * req.query.column_name - when ius called from column name only
   * req.query.search_value - search value optional
   * req.query.context_attributes - attributes
   * "context_attributes": [
      {
        "key": "AD_Client_ID",
        "value": 1000000
      },
      {
        "key": "AD_Org_ID",
        "value": 1000000
      },
      {
        "key": "Created",
        "value": "2020-10-13T16:14:23.000Z"
      },
      {
        "key": "CreatedBy",
        "value": 1000017
      },
      {
        "key": "IsActive",
        "value": true
      },
      {
        "key": "Value",
        "value": "Solo Pruebas"
      }
    ]
   *
   * Details:
   */
  api.get('/default-value', (req, res) => {
    const ServiceApi = require('@adempiere/grpc-api/src/services/userInterface');
    const service = new ServiceApi(config);

    if (req.query) {
      service.getDefaultValue({
        token: req.headers.authorization,
        //  Default Value Query
        processParameterUuid: req.query.process_parameter_uuid,
        fieldUuid: req.query.field_uuid,
        browseFieldUuid: req.query.browse_field_uuid,
        referenceUuid: req.query.reference_uuid,
        columnUuid: req.query.column_uuid,
        columnName: req.query.column_name,
        value: req.query.value,
        contextAttributes: req.query.context_attributes
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: {
              id: response.getId(),
              uuid: response.getUuid(),
              attributes: convertAttributes(response.getValuesMap())
            }
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * POST Run Callout
   *
   * req.query.token - user token
   * Body:
   * req.body.table_name - Table name of calling
   * req.body.window_uuid - uuid of window from call
   * req.body.tab_uuid - uuid of tab from call
   * req.body.callout - callout to call
   * req.body.column_name - column name of call
   * req.body.old_value - old value for column
   * req.body.value - new value of column
   * req.body.window_no - window number
   * req.body.attributes - attributes of entity
   "context_attributes": [
      {
        "key": "AD_Client_ID",
        "value": 1000000
      },
      {
        "key": "AD_Org_ID",
        "value": 1000000
      },
      {
        "key": "Created",
        "value": "2020-10-13T16:14:23.000Z"
      },
      {
        "key": "CreatedBy",
        "value": 1000017
      },
      {
        "key": "IsActive",
        "value": true
      },
      {
        "key": "Value",
        "value": "Solo Pruebas"
      }
    ]
   *
   * Details:https://sfa-docs.now.sh/guide/default-modules/api.html#get-vsbridgeuserorder-history
   */
  api.post('/run-callout', (req, res) => {
    const ServiceApi = require('@adempiere/grpc-api/src/services/userInterface');
    const service = new ServiceApi(config);

    if (req.body) {
      service.runCallout({
        token: req.headers.authorization,
        tableName: req.body.table_name,
        windowUuid: req.body.window_uuid,
        tabUuid: req.body.tab_uuid,
        callout: req.body.callout,
        columnName: req.body.column_name,
        valueType: req.body.value_type,
        oldValue: req.body.old_value,
        value: req.body.value,
        windowNo: req.body.window_no,
        contextAttributes: req.body.context_attributes
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: convertCalloutFromGRPC(response)
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * GET Entity, used for window refresh current record
   *
   * req.query.token - user token
   * req.query.tab_uuid - uuid of tab
   * req.query.id - record id
   * req.query.uuid - record uuid
   *
   * Details:
   */
  api.get('/entity', (req, res) => {
    const ServiceApi = require('@adempiere/grpc-api/src/services/userInterface');
    const service = new ServiceApi(config);

    if (req.query) {
      service.getTabEntity({
        token: req.headers.authorization,
        //  Running parameters
        windowUuid: req.query.window_uuid,
        tabUuid: req.query.tab_uuid,
        windowNo: req.query.window_no,
        //  DSL Query
        id: req.query.id,
        uuid: req.query.uuid
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: convertEntityFromGRPC(response)
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * POST Get List Entities, used for window list
   *
   * req.query.token - user token
   * req.query.page_size - size of page (customized)
   * req.query.page_token - token of page (optional for get a specific page)
   * req.body.search_value - search value
   * req.body.filters - query filters
   * req.body.table_name - table name (Mandatory if is not a query)
   * req.body.query - custom query instead a table name based on SQL
   * req.body.where_clause - where clause of search based on SQL
   * req.body.order_by_clause - order by clause based on SQL
   * req.body.limit - records limit
   *
   * Details:
   */
  api.post('/entities', (req, res) => {
    if (req.body) {
      const ServiceApi = require('@adempiere/grpc-api/src/services/userInterface');
      const service = new ServiceApi(config);

      service.listTabEntities({
        token: req.headers.authorization,
        //  Running parameters
        windowUuid: req.body.window_uuid,
        tabUuid: req.body.tab_uuid,
        windowNo: req.body.window_no,
        //  DSL Query
        referenceUuid: req.body.reference_uuid,
        filters: req.body.filters,
        //  Custom Query
        sorting: req.body.sorting,
        contextAttributes: req.body.context_attributes,
        searchValue: req.body.search_value,
        //  Page Data
        pageSize: req.query.page_size,
        pageToken: req.query.page_token
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: {
              record_count: response.getRecordCount(),
              next_page_token: response.getNextPageToken(),
              records: response.getRecordsList().map(entity => {
                return convertEntityFromGRPC(entity);
              })
            }
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * POST Create Entity data
   *
   * req.query.token - user token
   * req.body.tab_uuid - Uuid for tab
   * req.body.attributes - attributes for entity
   "attributes": [
      {
        "key": "AD_Client_ID",
        "value": 1000000
      },
      {
        "key": "Created",
        "value": "2020-10-13T16:14:23.000Z"
      },
      {
        "key": "IsActive",
        "value": true
      },
      {
        "key": "Name",
        "value": "Solo Pruebas"
      },
      {
        "key": "UUID",
        "value": "c326454b-0b5a-441d-8312-c86d504820ca"
      },
      {
        "key": "Value",
        "value": "Solo Pruebas"
      }
    ]
   * Details:
   */
  api.post('/create-entity', (req, res) => {
    const ServiceApi = require('@adempiere/grpc-api/src/services/userInterface');
    const service = new ServiceApi(config);

    if (req.body) {
      service.createTabEntity({
        token: req.headers.authorization,
        tabUuid: req.body.tab_uuid,
        attributes: req.body.attributes
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: convertEntityFromGRPC(response)
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  /**
   * POST Update Entity data
   *
   * req.query.token - user token
   * req.body.tab_uuid - Uuid for tab
   * req.body.id - id of entity
   * req.body.uuid - uuid of entity
   * req.body.attributes - attributes for entity
   "attributes": [
      {
        "key": "AD_Client_ID",
        "value": 1000000
      },
    ]
   */
  api.post('/update-entity', (req, res) => {
    const ServiceApi = require('@adempiere/grpc-api/src/services/userInterface');
    const service = new ServiceApi(config);

    if (req.body) {
      service.updateTabEntity({
        token: req.headers.authorization,
        tabUuid: req.body.tab_uuid,
        id: req.body.id,
        uuid: req.body.uuid,
        attributes: req.body.attributes
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: convertEntityFromGRPC(response)
          });
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          });
        }
      });
    }
  });

  return api;
};
