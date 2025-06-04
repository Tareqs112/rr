module.exports = (sequelize, DataTypes) => {
  const TourCampaign = sequelize.define('TourCampaign', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('planned', 'active', 'completed', 'cancelled'),
      defaultValue: 'planned'
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    current_participants: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    price_per_person: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    itinerary: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Detailed day-by-day itinerary of the tour'
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
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
    tableName: 'tour_campaigns',
    timestamps: true
  });

  return TourCampaign;
};
