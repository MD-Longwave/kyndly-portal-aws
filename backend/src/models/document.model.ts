import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Employer from './employer.model';

// Define attributes interface
interface DocumentAttributes {
  id: string;
  employerId: string;
  title: string;
  documentType: string;
  fileKey: string;
  fileUrl?: string;
  mimeType: string;
  fileSize: number;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define optional attributes for creation
interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'fileUrl' | 'uploadedBy'> {}

// Define the Document model class
class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: string;
  public employerId!: string;
  public title!: string;
  public documentType!: string;
  public fileKey!: string;
  public fileUrl?: string;
  public mimeType!: string;
  public fileSize!: number;
  public uploadedBy?: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model with schema definition
Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employers',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'documents',
    timestamps: true,
  }
);

// Define associations
Document.belongsTo(Employer, {
  foreignKey: 'employerId',
  as: 'employer',
});

export default Document; 