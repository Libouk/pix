const TABLE_USERS = 'users';
const PASSWORD_COLUMN = 'password';
const SHOULD_CHANGE_PASSWORD_COLUMN = 'shouldChangePassword';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_USERS, (table) => {
    table.renameColumn(PASSWORD_COLUMN, `${PASSWORD_COLUMN}Deprecated`);
    table.renameColumn(SHOULD_CHANGE_PASSWORD_COLUMN, `${SHOULD_CHANGE_PASSWORD_COLUMN}Deprecated`);
  });

};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_USERS, (table) => {
    table.renameColumn(`${PASSWORD_COLUMN}Deprecated`, PASSWORD_COLUMN);
    table.renameColumn(`${SHOULD_CHANGE_PASSWORD_COLUMN}Deprecated`, SHOULD_CHANGE_PASSWORD_COLUMN);
  });
};
