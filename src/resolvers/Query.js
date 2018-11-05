const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }

    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info,
    );
  },
  async users(parent, args, ctx, info) {
    // check if user logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    // check if the user has the permission to query all users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // query all users
    const users = await ctx.db.query.users({}, info);
    return users;
  },
  async order(parent, args, ctx, info) {
    // check if user logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    // query the current order
    const order = await ctx.db.query.order(
      {
        where: {
          id: args.id,
        },
      },
      info,
    );
    // check if permissions to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionsToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN',
    );

    if (!ownsOrder || !hasPermissionsToSeeOrder) {
      throw new Error('Nothing to see here! Move on!');
    }

    return order;
  },
  // async items(parent, args, ctx, info) {
  //   const items = await ctx.db.query.items();
  //   return items;
  // },
};

module.exports = Query;
