const util = require('util');
const fs = require('fs');
const JSZip = require('jszip');
const XLSX = require('xlsx');
const _ = require('lodash');
const { ODSBufferReadFailedError, ODSTableDataEmptyError, ODSTableHeadersNotFoundError } = require('../../domain/errors');

const CONTENT_XML_IN_ODS = 'content.xml';

module.exports = {
  getContentXml,
  makeUpdatedOdsByContentXml,
  extractTableDataFromOdsFile,
};

async function getContentXml({ odsFilePath }) {
  const zip = await _loadOdsTemplate(odsFilePath);
  const contentXmlBufferCompressed = zip.file(CONTENT_XML_IN_ODS);
  const uncompressedBuffer = await contentXmlBufferCompressed.async('nodebuffer');
  return Buffer.from(uncompressedBuffer, 'utf8').toString();
}

async function makeUpdatedOdsByContentXml({ stringifiedXml, odsFilePath }) {
  const zip = await _loadOdsTemplate(odsFilePath);
  await zip.file(CONTENT_XML_IN_ODS, stringifiedXml);
  const odsBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return odsBuffer;
}

async function _loadOdsTemplate(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return zip.loadAsync(odsFileData);
}

function _openOdsFile(odsFilePath) {
  return util.promisify(fs.readFile)(odsFilePath);
}

async function extractTableDataFromOdsFile({ odsBuffer, tableHeaderTargetPropertyMap }) {
  const sheetDataRows = await _getSheetDataRowsFromOdsBuffer(odsBuffer);
  const sheetHeaderRow = _getHeaderRow(sheetDataRows, tableHeaderTargetPropertyMap);
  const sheetDataRowsBelowHeader = _extractRowsBelowHeader(sheetHeaderRow, sheetDataRows);
  const sheetHeaderPropertyMap = _mapSheetHeadersWithProperties(sheetHeaderRow, tableHeaderTargetPropertyMap);

  const data = _transformSheetDataRows(sheetDataRowsBelowHeader, sheetHeaderPropertyMap);
  if (_.isEmpty(data)) {
    throw new ODSTableDataEmptyError();
  }
  return data;
}

async function _getSheetDataRowsFromOdsBuffer(odsBuffer) {
  let document;
  try {
    document = await XLSX.read(odsBuffer, { type: 'buffer', cellDates: true, });
  } catch (error) {
    throw new ODSBufferReadFailedError(error);
  }
  const sheet = document.Sheets[document.SheetNames[0]];
  const sheetDataRows = XLSX.utils.sheet_to_json(sheet, { header: 'A' });
  if (_.isEmpty(sheetDataRows)) {
    throw new ODSBufferReadFailedError('Empty data in sheet');
  }
  return sheetDataRows;
}

function _extractRowsBelowHeader(sheetHeaderRow, sheetDataRows) {
  const headerIndex = _.findIndex(sheetDataRows, (row) => _.isEqual(row, sheetHeaderRow));
  return _takeRightUntilIndex({ array: sheetDataRows, index: headerIndex + 1 });
}

function _takeRightUntilIndex({ array, index }) {
  const countElementsToTake = _.size(array) - index;
  return _.takeRight(array, countElementsToTake);
}

function _getHeaderRow(sheetDataRows, tableHeaderTargetPropertyMap) {
  const headers = _.map(tableHeaderTargetPropertyMap, (item) => item.header);
  const sheetHeaderRow = _.find(sheetDataRows, (row) => _allHeadersValuesAreInTheRow(row, headers));
  if (!sheetHeaderRow) {
    throw new ODSTableHeadersNotFoundError();
  }
  return sheetHeaderRow;
}

function _allHeadersValuesAreInTheRow(row, headers) {
  const cellValuesInRow = _.values(row);
  const headersInRow = _.intersection(cellValuesInRow, headers);
  return headersInRow.length === headers.length;
}

function _mapSheetHeadersWithProperties(sheetHeaderRow, tableHeaderTargetPropertyMap) {
  return _(sheetHeaderRow)
    .map(addTargetDatas(tableHeaderTargetPropertyMap))
    .compact()
    .value();
}

function addTargetDatas(tableHeaderTargetPropertyMap) {
  return (header, columnName) => {
    const targetProperties = _.find(tableHeaderTargetPropertyMap, { header });
    if (targetProperties) {
      const { property: targetProperty, transformFn } = targetProperties;
      return { columnName, targetProperty, transformFn };
    }
  };
}

function _transformSheetDataRows(sheetDataRows, sheetHeaderPropertyMap) {
  return _.map(sheetDataRows, (sheetDataRow) => _transformSheetDataRow(sheetDataRow, sheetHeaderPropertyMap));
}

function _transformSheetDataRow(sheetDataRow, sheetHeaderPropertyMap) {
  return _.reduce(sheetHeaderPropertyMap, (target, { columnName, targetProperty, transformFn }) => {
    const cellValue = sheetDataRow[columnName];
    target[targetProperty] = transformFn(cellValue);
    return target;
  }, {});
}
