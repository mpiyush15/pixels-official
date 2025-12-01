import { getDatabase } from './mongodb';
import { Collection, ObjectId } from 'mongodb';
import { Staff, DailyContent } from '@/types/staff';
import bcrypt from 'bcryptjs';

export async function getStaffCollection(): Promise<Collection<Staff>> {
  const db = await getDatabase();
  return db.collection<Staff>('staff');
}

export async function getDailyContentCollection(): Promise<Collection<DailyContent>> {
  const db = await getDatabase();
  return db.collection<DailyContent>('dailyContent');
}

// Staff operations
export async function createStaff(staff: Omit<Staff, '_id' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
  const collection = await getStaffCollection();
  const hashedPassword = await bcrypt.hash(staff.password, 10);
  
  const newStaff = {
    ...staff,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await collection.insertOne(newStaff as any);
  return { ...newStaff, _id: result.insertedId.toString() };
}

export async function getStaffById(id: string): Promise<Staff | null> {
  const collection = await getStaffCollection();
  const staff = await collection.findOne({ _id: new ObjectId(id) as any });
  if (!staff) return null;
  return { ...staff, _id: staff._id.toString() };
}

export async function getStaffByEmail(email: string): Promise<Staff | null> {
  const collection = await getStaffCollection();
  const staff = await collection.findOne({ email });
  if (!staff) return null;
  return { ...staff, _id: staff._id?.toString() };
}

export async function getAllStaff(): Promise<Staff[]> {
  const collection = await getStaffCollection();
  const staff = await collection.find({}).toArray();
  return staff.map(s => ({ ...s, _id: s._id?.toString() }));
}

export async function updateStaff(id: string, updates: Partial<Staff>): Promise<boolean> {
  const collection = await getStaffCollection();
  
  const updateData: any = { ...updates, updatedAt: new Date() };
  
  // Remove password field if it's undefined or empty
  if (!updates.password) {
    delete updateData.password;
  } else {
    // Hash password if it's being updated
    updateData.password = await bcrypt.hash(updates.password, 10);
  }
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) as any },
    { $set: updateData }
  );
  
  return result.modifiedCount > 0 || result.matchedCount > 0;
}

export async function deleteStaff(id: string): Promise<boolean> {
  const collection = await getStaffCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) as any });
  return result.deletedCount > 0;
}

export async function verifyStaffPassword(email: string, password: string): Promise<Staff | null> {
  const staff = await getStaffByEmail(email);
  if (!staff) return null;
  
  const isValid = await bcrypt.compare(password, staff.password);
  if (!isValid) return null;
  
  return staff;
}

// Daily Content operations
export async function createDailyContent(content: Omit<DailyContent, '_id' | 'createdAt'>): Promise<DailyContent> {
  const collection = await getDailyContentCollection();
  
  const newContent = {
    ...content,
    createdAt: new Date(),
  };
  
  const result = await collection.insertOne(newContent as any);
  return { ...newContent, _id: result.insertedId.toString() };
}

export async function getAllDailyContent(): Promise<DailyContent[]> {
  const collection = await getDailyContentCollection();
  const content = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return content.map(c => ({ ...c, _id: c._id?.toString() }));
}

export async function getDailyContentByClient(clientId: string): Promise<DailyContent[]> {
  const collection = await getDailyContentCollection();
  const content = await collection.find({ clientId }).sort({ createdAt: -1 }).toArray();
  return content.map(c => ({ ...c, _id: c._id?.toString() }));
}

export async function getDailyContentByStaff(staffId: string): Promise<DailyContent[]> {
  const collection = await getDailyContentCollection();
  const content = await collection.find({ createdBy: staffId }).sort({ createdAt: -1 }).toArray();
  return content.map(c => ({ ...c, _id: c._id?.toString() }));
}

export async function deleteDailyContent(id: string): Promise<boolean> {
  const collection = await getDailyContentCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) as any });
  return result.deletedCount > 0;
}
