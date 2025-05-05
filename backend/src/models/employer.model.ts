import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Define attributes interface
interface EmployerAttributes {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  employeeCount: number;
  status: 'active' | 'pending' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Define optional attributes for creation
interface EmployerCreationAttributes extends Optional<EmployerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

// Define the Employer model class
class Employer extends Model<EmployerAttributes, EmployerCreationAttributes> implements EmployerAttributes {
  public id!: string;
  public name!: string;
  public contactPerson!: string;
  public email!: string;
  public phone!: string;
  public address!: string;
  public employeeCount!: number;
  public status!: 'active' | 'pending' | 'inactive';
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model with schema definition
Employer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    employeeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'inactive'),
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'employers',
    timestamps: true,
  }
);

export default Employer; 