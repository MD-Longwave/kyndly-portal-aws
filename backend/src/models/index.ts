import Employer from './employer.model';
import Quote from './quote.model';
import Document from './document.model';

// Define associations
Employer.hasMany(Quote, {
  sourceKey: 'id',
  foreignKey: 'employerId',
  as: 'quotes',
});

Employer.hasMany(Document, {
  sourceKey: 'id',
  foreignKey: 'employerId',
  as: 'documents',
});

Quote.belongsTo(Employer, {
  foreignKey: 'employerId',
  as: 'employer',
});

Document.belongsTo(Employer, {
  foreignKey: 'employerId',
  as: 'employer',
});

export {
  Employer,
  Quote,
  Document
}; 