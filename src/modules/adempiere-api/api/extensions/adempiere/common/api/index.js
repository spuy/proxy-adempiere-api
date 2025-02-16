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

import {
  convertProcessLogFromGRPC,
  convertEntityFromGRPC
} from '@adempiere/grpc-api/lib/convertBaseDataType';

module.exports = ({ config, db }) => {
  const api = Router();
  const ServiceApi = require('@adempiere/grpc-api');
  const service = new ServiceApi(config);

  /**
   * GET Entity data
   *
   * req.query.token - user token
   * req.query.id - id of entity
   * req.query.uuid - uuid of entity
   * req.query.table_name - table name of entity
   *
   * Details:
   */
  api.get('/entity', (req, res) => {
    if (req.query) {
      service.getEntity({
        token: req.headers.authorization,
        tableName: req.query.table_name,
        id: req.query.id,
        uuid: req.query.uuid
      }, function (err, response) {
        if (response) {
          res.json({
            code: 200,
            result: convertEntityFromGRPC(response)
          })
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          })
        }
      })
    }
  });

  /**
   * List Entities
   *
   * req.query.token - user token
   * req.query.page_size - custom page size for batch
   * req.query.page_token - specific page token
   * req.query.filters - query filters
   [
     {
       column_name: 'DocStatus',
       operator: 'EQUAL',
       value: 'CO'
     },
     {
       column_name: 'DateInvoiced',
       operator: 'BETWEEN',
       value: '2020-01-01'
       value_to: '2020-09-01'
     },
     {
       column_name: 'C_DocType_ID',
       operator: 'IN',
       values: [
         1000000,
         1000562
       ]
     }
   ],
   value: condition.value,
   valueTo: condition.value_to,
   values: condition.values,
   operator: condition.operator
   * req.query.columns - query columns
   * req.query.table_name - table name (Mandatory if is not a query)
   * req.query.query - custom query instead a table name based on SQL
   * req.query.where_clause - where clause of search based on SQL
   * req.query.order_by_clause - order by clause based on SQL
   * req.query.limit - records limit
   *
   * Details:
   */
  api.get('/entites', (req, res) => {
    if (req.query) {
      service.listEntities({
        token: req.headers.authorization,
        tableName: req.query.table_name,
        //  DSL Query
        filters: req.query.filters,
        columns: req.query.columns,
        //  Custom Query
        query: req.query.query,
        whereClause: req.query.where_clause,
        orderByClause: req.query.order_by_clause,
        limit: req.query.limit,
        //  Page Data
        pageSize: req.query.page_size,
        pageToken: req.query.page_token
      }, function (err, response) {
        if (response) {
          res.json({
            code: 200,
            result: {
              record_count: response.getRecordCount(),
              next_page_token: response.getNextPageToken(),
              records: response.getRecordsList().map(entity => {
                return convertEntityFromGRPC(entity)
              })
            }
          })
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          })
        }
      })
    }
  });

  /**
   * POST Create Entity data
   *
   * req.query.token - user token
   * req.body.table_name - table name of entity
   * req.body.attributes - attributes for entity
   "attributes": [
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
        "key": "IsDefault",
        "value": false
      },
      {
        "key": "M_Product_Group_ID",
        "value": 1000110
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
        "key": "Updated",
        "value": "2020-10-13T16:14:23.000Z"
      },
      {
        "key": "UpdatedBy",
        "value": 1000017
      },
      {
        "key": "Value",
        "value": "Solo Pruebas"
      }
    ]
   * Details:
   */
  api.post('/create', (req, res) => {
    if (req.body) {
      service.createEntity({
        token: req.headers.authorization,
        tableName: req.body.table_name,
        attributes: req.body.attributes
      }, function (err, response) {
        if (response) {
          res.json({
            code: 200,
            result: convertEntityFromGRPC(response)
          })
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          })
        }
      })
    }
  });

  /**
   * POST Run Process
   *
   * req.query.token - user token
   * req.body.table_name - table name of entity
   * req.body.parameters - parameters for running
   * req.body.process_uuid,
   * req.body.table_name,
   * req.body.uuid,
   * req.body.id,
   * req.body.table_selected_id,
   * req.body.report_type,
   * req.body.print_format_uuid,
   * req.body.report_view_uuid,
   * req.body.is_summary,
   * req.body.parameters,
   * req.body.selections
   "parameters": [
      {
        "key": "AD_Client_ID",
        "value": 1000000
      },
      {
        "key": "AD_Org_ID",
        "value": 1000000
      }
    ]
   * Details:
   */
  api.post('/process', (req, res) => {
    const BusinessDataService = require('@adempiere/grpc-api/src/services/businessData');
    const service = new BusinessDataService(config);

    if (req.body) {
      service.runProcess({
        token: req.headers.authorization,
        //  Running parameters
        processUuid: req.body.process_uuid,
        tableName: req.body.table_name,
        uuid: req.body.uuid,
        id: req.body.id,
        tableSelectedId: req.body.table_selected_id,
        reportType: req.body.report_type,
        printFormatUuid: req.body.print_format_uuid,
        reportViewUuid: req.body.report_view_uuid,
        isSummary: req.body.is_summary,
        parametersList: req.body.parameters,
        selectionsList: req.body.selections
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: convertProcessLogFromGRPC(response)
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
   * req.body.table_name - table name of entity
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
  api.post('/update', (req, res) => {
    if (req.body) {
      service.updateEntity({
        token: req.headers.authorization,
        tableName: req.body.table_name,
        id: req.body.id,
        uuid: req.body.uuid,
        attributes: req.body.attributes
      }, function (err, response) {
        if (response) {
          res.json({
            code: 200,
            result: convertEntityFromGRPC(response)
          })
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          })
        }
      })
    }
  });

  /**
   * Delete Entity
   *
   * req.query.token - user token
   * Body:
   * req.body.table_name - table name (Mandatory if is not a query)
   * req.body.id - id of entity
   * req.body.uuid - uuid of entity
   * req.body.table_name - table name of entity
   * Details:
   */
  api.post('/delete', (req, res) => {
    if (req.body) {
      service.deleteEntity({
        token: req.headers.authorization,
        id: req.body.id,
        uuid: req.body.uuid,
        ids: req.body.ids,
        tableName: req.body.table_name
      }, function (err, response) {
        if (response) {
          res.json({
            code: 200,
            result: 'Ok'
          })
        } else if (err) {
          res.json({
            code: 500,
            result: err.details
          })
        }
      })
    }
  });

  return api;
};
