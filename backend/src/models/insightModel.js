import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/db.js';

class InsightModel {
  static async create(insightData) {
    const { data, error } = await supabase
      .from('insights')
      .insert(insightData)
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Database error: ${error.message}`);
    return data || [];
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  }

  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('insights')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('insights')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Database error: ${error.message}`);
    return true;
  }
}

export default InsightModel;
