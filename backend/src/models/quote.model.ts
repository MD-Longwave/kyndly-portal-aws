import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Define attributes interface
interface QuoteAttributes {
  id: string;
  transperraRep: string;
  contactType: string;
  companyName: string;
  censusFileKey?: string;
  planComparisonFileKey?: string;
  ichraEffectiveDate: Date;
  pepm: number;
  currentFundingStrategy?: string;
  targetDeductible?: number;
  targetHSA?: string;
  brokerName?: string;
  brokerEmail?: string;
  priorityLevel: string;
  additionalNotes?: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  tpaId: string;
  employerId: string;
  submissionId: string;
  isGLI?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define optional attributes for creation
interface QuoteCreationAttributes extends Optional<QuoteAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'censusFileKey' | 'planComparisonFileKey' | 'currentFundingStrategy' | 'targetDeductible' | 'targetHSA' | 'brokerName' | 'brokerEmail' | 'additionalNotes' | 'submissionId' | 'isGLI'> {}

// Define the Quote model class
class Quote extends Model<QuoteAttributes, QuoteCreationAttributes> implements QuoteAttributes {
  public id!: string;
  public transperraRep!: string;
  public contactType!: string;
  public companyName!: string;
  public censusFileKey?: string;
  public planComparisonFileKey?: string;
  public ichraEffectiveDate!: Date;
  public pepm!: number;
  public currentFundingStrategy?: string;
  public targetDeductible?: number;
  public targetHSA?: string;
  public brokerName?: string;
  public brokerEmail?: string;
  public priorityLevel!: string;
  public additionalNotes?: string;
  public status!: 'new' | 'in_progress' | 'completed' | 'cancelled';
  public tpaId!: string;
  public employerId!: string;
  public submissionId!: string;
  public isGLI?: boolean;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model with schema definition
Quote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transperraRep: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    censusFileKey: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'S3 key for census file following partitioning structure'
    },
    planComparisonFileKey: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'S3 key for plan comparison file following partitioning structure'
    },
    ichraEffectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    pepm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 70.00,
    },
    currentFundingStrategy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    targetDeductible: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    targetHSA: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brokerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brokerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priorityLevel: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'earliest',
    },
    additionalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'new',
    },
    tpaId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID of the TPA submitting the quote'
    },
    employerId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID of the employer for whom the quote is submitted'
    },
    submissionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      comment: 'Unique ID for this submission, used in S3 partitioning'
    },
    isGLI: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Whether this is a GLI or Non-GLI quote'
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
    tableName: 'quotes',
    timestamps: true,
  }
);

export default Quote; 