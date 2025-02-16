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

import { getLookupItemFromGRPC } from '@adempiere/grpc-api/src/utils/userInterfaceFromGRPC';
import {
  getPaymentSelectionFromGRPC,
  getPaymentFromGRPC,
  getProcessFromGRPC,
  getExportFromGRPC,
  getPrintFromGRPC,
  getPrintRemittanceFromGRPC
} from '@adempiere/grpc-api/src/utils/paymentPrintExportFromGRPC';

module.exports = ({ config }: ExtensionAPIFunctionParameter) => {
  const api = Router();
  const ServiceApi = require('@adempiere/grpc-api/src/services/paymentPrintExport')
  const service = new ServiceApi(config);

  api.get('/payment-selection', (req, res) => {
    if (req.query) {
      service.getPaymentSelection({
        token: req.headers.authorization,
        //  DSL Query
        id: req.query.id,
        uuid: req.query.uuid
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: getPaymentSelectionFromGRPC(
              response
            )
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

  api.post('/list-payment-selections', (req, res) => {
    if (req.body) {
      service.listPaymentSelections({
        token: req.headers.authorization,
        //  DSL Query
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
              records: response.getRecordsList().map(lookupItem => {
                return getLookupItemFromGRPC(lookupItem)
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

  api.post('/list-payment-rules', (req, res) => {
    if (req.body) {
      service.listPaymentRules({
        token: req.headers.authorization,
        //  DSL Query
        searchValue: req.body.search_value,
        paymentSelectionId: req.body.payment_selection_id,
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
                return getLookupItemFromGRPC(lookupItem)
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

  api.post('/list-payments', (req, res) => {
    if (req.body) {
      service.listPayments({
        token: req.headers.authorization,
        //  DSL Query
        searchValue: req.body.search_value,
        paymentSelectionId: req.body.payment_selection_id,
        paymentRuleId: req.body.payment_rule_id,
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
              records: response.getRecordsList().map(payment => {
                return getPaymentFromGRPC(payment)
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

  api.get('/document-no', (req, res) => {
    if (req.query) {
      service.getDocumentNo({
        token: req.headers.authorization,
        // DSL Query
        bankAccountId: req.query.bank_account_id,
        paymentRuleId: req.query.payment_rule_id
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: {
              document_no: response.getDocumentNo()
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

  api.post('/process', (req, res) => {
    if (req.body) {
      service.process({
        token: req.headers.authorization,
        //  DSL Query
        paymentSelectionId: req.body.payment_selection_id,
        paymentRuleId: req.body.payment_rule_id,
        documentNo: req.body.document_no,
        bankAccountId: req.body.bank_account_id
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: getProcessFromGRPC(
              response
            )
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

  api.post('/export', (req, res) => {
    if (req.body) {
      service.export({
        token: req.headers.authorization,
        //  DSL Query
        paymentSelectionId: req.body.payment_selection_id,
        paymentRuleId: req.body.payment_rule_id,
        documentNo: req.body.document_no,
        bankAccountId: req.body.bank_account_id
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: getExportFromGRPC(
              response
            )
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

  api.post('/print', (req, res) => {
    if (req.body) {
      service.print({
        token: req.headers.authorization,
        //  DSL Query
        paymentSelectionId: req.body.payment_selection_id,
        paymentRuleId: req.body.payment_rule_id,
        documentNo: req.body.document_no
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: getPrintFromGRPC(
              response
            )
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

  api.post('/confirm-print', (req, res) => {
    if (req.body) {
      service.confirmPrint({
        token: req.headers.authorization,
        //  DSL Query
        paymentSelectionId: req.body.payment_selection_id,
        paymentRuleId: req.body.payment_rule_id,
        documentNo: req.body.document_no,
        bankAccountId: req.body.bank_account_id
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: {
              document_no: response.getDocumentNo()
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

  api.post('/print-remittance', (req, res) => {
    if (req.body) {
      service.printRemittance({
        token: req.headers.authorization,
        //  DSL Query
        paymentSelectionId: req.body.payment_selection_id,
        paymentRuleId: req.body.payment_rule_id,
        documentNo: req.body.document_no
      }, (err, response) => {
        if (response) {
          res.json({
            code: 200,
            result: getPrintRemittanceFromGRPC(
              response
            )
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
