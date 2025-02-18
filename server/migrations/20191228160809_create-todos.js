
exports.up = function(knex) {
    return knex.schema.createTable('todos', function(table){
        table.increments('id').primary();
        table.string('title').notNullable();
        table.integer('order').defaultTo(0);
        table.boolean('completed').defaultTo(false);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('todos');
};