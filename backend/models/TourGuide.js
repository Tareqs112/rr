module.exports = (sequelize, DataTypes) => {
  const TourGuide = sequelize.define('TourGuide', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    specialties: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('available', 'busy', 'on_leave'),
      defaultValue: 'available'
    },
    years_experience: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    certification: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id'
      },
      comment: 'For multi-tenant SaaS implementation'
    }
  }, {
    tableName: 'tour_guides',
    timestamps: true
  });

  return TourGuide;
};
