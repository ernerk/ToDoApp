import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

export default function Index() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim().length > 0) {
      setTasks([...tasks, { id: Math.random().toString(), text: task, completed: false }]);
      setTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.taskContainer}
    >
      <LinearGradient
        colors={item.completed ? ['#E8E8E8', '#F5F5F5'] : ['#ffffff', '#f8f9fa']}
        style={styles.taskGradient}
      >
        <TouchableOpacity
          style={[styles.task, item.completed && styles.completedTask]}
          onPress={() => toggleTask(item.id)}
        >
          <View style={[styles.checkbox, item.completed && styles.checkedBox]} />
          <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
            {item.text}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTask(item.id)}
        >
          <Text style={styles.deleteButtonText}>Sil</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animatable.Text 
          animation="fadeInDown" 
          style={styles.title}
        >
          Yapılacaklar Listesi
        </Animatable.Text>
        <Animatable.View 
          animation="fadeInUp" 
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            placeholder="Yeni görev ekle..."
            placeholderTextColor="#666"
            value={task}
            onChangeText={setTask}
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addTask}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#00b09b', '#96c93d']}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonText}>Ekle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  taskContainer: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  taskGradient: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  task: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b5998',
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: '#3b5998',
    borderColor: '#3b5998',
  },
  taskText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  completedTask: {
    opacity: 0.7,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 