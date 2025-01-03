import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, Modal, Keyboard, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import moment from 'moment';
import 'moment/locale/tr';

moment.locale('tr');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const CATEGORIES = [
  { id: '1', name: 'İş', icon: 'work', color: '#3498db', iconFamily: 'MaterialIcons' },
  { id: '2', name: 'Kişisel', icon: 'account', color: '#e74c3c', iconFamily: 'MaterialCommunityIcons' },
  { id: '3', name: 'Alışveriş', icon: 'shopping', color: '#2ecc71', iconFamily: 'MaterialCommunityIcons' },
  { id: '4', name: 'Eğitim', icon: 'school', color: '#9b59b6', iconFamily: 'MaterialIcons' },
  { id: '5', name: 'Sağlık', icon: 'heart', color: '#e84393', iconFamily: 'MaterialCommunityIcons' }
];

const PRIORITIES = [
  { id: 'low', name: 'Düşük', color: '#2ecc71', icon: 'arrow-down' },
  { id: 'medium', name: 'Orta', color: '#f1c40f', icon: 'arrow-right' },
  { id: 'high', name: 'Yüksek', color: '#e74c3c', icon: 'arrow-up' },
  { id: 'urgent', name: 'Acil', color: '#c0392b', icon: 'alert' }
];

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const confettiAnimation = useRef(null);
  const inputRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [subtaskText, setSubtaskText] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync();
    checkOverdueTasks();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Bildirim izni olmadan hatırlatıcıları kullanamazsınız!');
    }
  };

  const scheduleNotification = async (task) => {
    if (task.dueDate) {
      const trigger = new Date(task.dueDate);
      trigger.setHours(9); // Sabah 9'da bildirim
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Görev Hatırlatıcı',
          body: `"${task.text}" görevi için son gün!`,
          data: { taskId: task.id },
        },
        trigger,
      });
    }
  };

  const checkOverdueTasks = () => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.dueDate && new Date(task.dueDate) < now && !task.completed) {
        task.isOverdue = true;
      }
    });
  };

  const playConfettiAnimation = () => {
    setShowConfetti(true);
    if (confettiAnimation.current) {
      confettiAnimation.current.play();
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
    }
  };

  const addTask = () => {
    if (task.trim().length > 0 && selectedCategory && selectedPriority) {
      const newTask = {
        id: Math.random().toString(),
        text: task.trim(),
        completed: false,
        progress: 0,
        category: selectedCategory,
        priority: selectedPriority,
        createdAt: new Date().getTime(),
        dueDate: selectedDate,
        subtasks: [],
        isOverdue: false
      };

      setTasks([...tasks, newTask]);
      scheduleNotification(newTask);
      setTask('');
      setSelectedDate(null);
      setShowCategoryModal(false);
      setShowPriorityModal(false);
      Keyboard.dismiss();
      if (inputRef.current) {
        inputRef.current.clear();
      }
    } else if (!selectedCategory) {
      setShowCategoryModal(true);
    } else if (!selectedPriority) {
      setShowPriorityModal(true);
    }
  };

  const addSubtask = () => {
    if (subtaskText.trim().length > 0 && selectedTask) {
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task,
            subtasks: [
              ...task.subtasks,
              {
                id: Math.random().toString(),
                text: subtaskText.trim(),
                completed: false
              }
            ]
          };
        }
        return task;
      });

      setTasks(updatedTasks);
      setSubtaskText('');
      setShowSubtaskModal(false);
    }
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(subtask => 
          subtask.id === subtaskId ? {...subtask, completed: !subtask.completed} : subtask
        );
        
        // Ana görevin ilerlemesini güncelle
        const completedSubtasks = updatedSubtasks.filter(st => st.completed).length;
        const progress = Math.round((completedSubtasks / updatedSubtasks.length) * 100);
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          progress: progress,
          completed: progress === 100
        };
      }
      return task;
    }));
  };

  const renderSubtasks = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;

    return (
      <View style={styles.subtasksContainer}>
        {task.subtasks.map(subtask => (
          <TouchableOpacity
            key={subtask.id}
            style={styles.subtaskItem}
            onPress={() => toggleSubtask(task.id, subtask.id)}
          >
            <View style={[styles.subtaskCheckbox, subtask.completed && styles.subtaskChecked]} />
            <Text style={[
              styles.subtaskText,
              subtask.completed && styles.subtaskCompleted
            ]}>
              {subtask.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCategoryIcon = (category) => {
    if (category.iconFamily === 'MaterialIcons') {
      return <MaterialIcons name={category.icon} size={28} color={category.color} style={styles.categoryIcon} />;
    }
    return <MaterialCommunityIcons name={category.icon} size={28} color={category.color} style={styles.categoryIcon} />;
  };

  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Kategori Seçin</Text>
          <FlatList
            data={CATEGORIES}
            horizontal={false}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === item.id && styles.selectedCategory,
                  { borderColor: item.color }
                ]}
                onPress={() => {
                  setSelectedCategory(item);
                  setShowCategoryModal(false);
                }}
              >
                {renderCategoryIcon(item)}
                <Text style={[styles.categoryText, { color: item.color }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowCategoryModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPriorityIcon = (priority) => {
    return <MaterialCommunityIcons name={priority.icon} size={24} color={priority.color} style={styles.priorityIcon} />;
  };

  const PriorityModal = () => (
    <Modal
      visible={showPriorityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPriorityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Öncelik Seçin</Text>
          <View style={styles.priorityList}>
            {PRIORITIES.map((priority) => (
              <TouchableOpacity
                key={priority.id}
                style={[
                  styles.priorityItem,
                  selectedPriority?.id === priority.id && styles.selectedPriority,
                  { borderColor: priority.color }
                ]}
                onPress={() => {
                  setSelectedPriority(priority);
                  setShowPriorityModal(false);
                }}
              >
                {renderPriorityIcon(priority)}
                <Text style={[styles.priorityText, { color: priority.color }]}>{priority.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowPriorityModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const toggleTask = (taskId) => {
    setTasks(
      tasks.map((item) => {
        if (item.id === taskId) {
          const newCompleted = !item.completed;
          if (newCompleted) {
            playConfettiAnimation();
          }
          return {...item, completed: newCompleted, progress: newCompleted ? 100 : 0};
        }
        return item;
      }),
    );
  };

  const updateProgress = (taskId, newProgress) => {
    setTasks(
      tasks.map((item) => {
        if (item.id === taskId) {
          const isCompleted = newProgress === 100;
          if (isCompleted) {
            playConfettiAnimation();
          }
          return {
            ...item, 
            progress: newProgress,
            completed: isCompleted
          };
        }
        return item;
      }),
    );
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((item) => item.id !== taskId));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority.id] - priorityOrder[b.priority.id] || b.createdAt - a.createdAt;
  });

  const renderItem = ({item}) => (
    <View style={[
      styles.taskContainer,
      { borderLeftWidth: 4, borderLeftColor: item.category.color },
      item.priority.id === 'urgent' && styles.urgentTask,
      item.isOverdue && styles.overdueTask
    ]}>
      <TouchableOpacity
        style={[styles.checkBox, item.completed && styles.checkedBox]}
        onPress={() => toggleTask(item.id)}>
        {item.completed && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            {renderCategoryIcon(item.category)}
            <View style={styles.priorityBadge}>
              {renderPriorityIcon(item.priority)}
            </View>
            <Text
              style={[
                styles.taskText,
                item.completed && styles.completedTask,
                item.isOverdue && styles.overdueText
              ]}>
              {item.text}
            </Text>
          </View>
          <Text style={styles.percentageText}>{item.progress}%</Text>
        </View>
        {item.dueDate && (
          <Text style={[
            styles.dueDate,
            item.isOverdue && styles.overdueDueDate
          ]}>
            Son Tarih: {moment(item.dueDate).format('DD MMMM YYYY')}
          </Text>
        )}
        <View style={styles.progressBarContainer}>
          <View style={[
            styles.progressBar,
            { width: `${item.progress}%`, backgroundColor: item.category.color }
          ]} />
        </View>
        {renderSubtasks(item)}
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: item.category.color }]}
            onPress={() => {
              setSelectedTask(item);
              setShowSubtaskModal(true);
            }}>
            <Text style={styles.actionButtonText}>Alt Görev Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: item.category.color }]}
            onPress={() => deleteTask(item.id)}>
            <Text style={styles.deleteButtonText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const SubtaskModal = () => (
    <Modal
      visible={showSubtaskModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSubtaskModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShowSubtaskModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalContent} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.modalTitle}>Alt Görev Ekle</Text>
          <TextInput
            style={styles.subtaskInput}
            placeholder="Alt görev..."
            value={subtaskText}
            onChangeText={setSubtaskText}
            autoFocus={true}
            onSubmitEditing={addSubtask}
            returnKeyType="done"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowSubtaskModal(false)}
            >
              <Text style={styles.modalButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={addSubtask}
            >
              <Text style={styles.modalButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Görev Takip</Text>
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons
            name="event"
            size={28}
            color={selectedDate ? '#3498db' : '#666'}
          />
          <Text style={[styles.dateText, !selectedDate && styles.dateTextPlaceholder]}>
            {selectedDate ? moment(selectedDate).format('DD MMMM YYYY') : 'Tarih seçin'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory && { backgroundColor: 'white', borderWidth: 2, borderColor: selectedCategory.color }]}
          onPress={() => setShowCategoryModal(true)}
        >
          {selectedCategory ? (
            renderCategoryIcon(selectedCategory)
          ) : (
            <MaterialIcons name="category" size={28} color="#666" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.priorityButton, selectedPriority && { backgroundColor: 'white', borderWidth: 2, borderColor: selectedPriority.color }]}
          onPress={() => setShowPriorityModal(true)}
        >
          {selectedPriority ? (
            renderPriorityIcon(selectedPriority)
          ) : (
            <MaterialIcons name="flag" size={28} color="#666" />
          )}
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Yeni görev ekle..."
          value={task}
          onChangeText={setTask}
          onSubmitEditing={addTask}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[styles.addButton, selectedCategory && { backgroundColor: selectedCategory.color }]}
          onPress={addTask}
          activeOpacity={0.7}>
          <Text style={styles.addButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedTasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
      <CategoryModal />
      <PriorityModal />
      <SubtaskModal />
      {showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
                textColor="#000000"
                style={styles.datePicker}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerButtonText}>Tamam</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <LottieView
            ref={confettiAnimation}
            source={{
              uri: 'https://assets10.lottiefiles.com/packages/lf20_u4yrau.json'
            }}
            autoPlay
            loop={false}
            style={styles.confetti}
            speed={1.5}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  checkMark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
    marginRight: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  percentageText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 2,
  },
  progressButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  progressButton: {
    backgroundColor: '#bdc3c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  progressButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  confetti: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  categoryItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectedCategory: {
    backgroundColor: '#f8f9fa',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoryButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryIcon: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  priorityIcon: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  priorityList: {
    width: '100%',
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  selectedPriority: {
    backgroundColor: '#f8f9fa',
  },
  priorityText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityBadge: {
    marginRight: 8,
  },
  urgentTask: {
    shadowColor: '#c0392b',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  dateContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  dateTextPlaceholder: {
    color: '#666',
    fontWeight: 'normal',
  },
  dueDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    marginBottom: 8,
  },
  overdueDueDate: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  overdueTask: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  overdueText: {
    color: '#e74c3c',
  },
  subtasksContainer: {
    marginTop: 8,
    marginLeft: 20,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subtaskCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#95a5a6',
    marginRight: 8,
  },
  subtaskChecked: {
    backgroundColor: '#95a5a6',
  },
  subtaskText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  subtaskCompleted: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  subtaskInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  datePicker: {
    width: Platform.OS === 'ios' ? 320 : 'auto',
    height: Platform.OS === 'ios' ? 200 : 'auto',
  },
  datePickerButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  datePickerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
