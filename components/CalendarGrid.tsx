import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  bookings: any[];
  blockedDates: string[];
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  bookings,
  blockedDates,
}) => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 7 : firstDay; // Convert Sunday (0) to 7
  };

  const getDaysArray = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 1; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const hasBooking = (day: number) => {
    if (!day) return false;
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return bookings.some(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.toDateString() === dateToCheck.toDateString();
    });
  };

  const isBlocked = (day: number) => {
    if (!day) return false;
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return blockedDates.some(blockedDate => {
      const blocked = new Date(blockedDate);
      return blocked.toDateString() === dateToCheck.toDateString();
    });
  };

  const isSelected = (day: number) => {
    if (!day) return false;
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return dateToCheck.toDateString() === selectedDate.toDateString();
  };

  const isToday = (day: number) => {
    if (!day) return false;
    const today = new Date();
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return dateToCheck.toDateString() === today.toDateString();
  };

  const handleDayPress = (day: number) => {
    if (!day) return;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(newDate);
  };

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const days = getDaysArray();

  return (
    <View style={styles.container}>
      {/* Week headers */}
      <View style={styles.weekHeader}>
        {weekDays.map((weekDay, index) => (
          <Text key={index} style={styles.weekDayText}>
            {weekDay}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              !day && styles.emptyCell,
              isSelected(day) && styles.selectedDay,
              isToday(day) && styles.todayCell,
              hasBooking(day) && styles.bookingDay,
              isBlocked(day) && styles.blockedDay,
            ]}
            onPress={() => handleDayPress(day)}
            disabled={!day}
          >
            {day && (
              <>
                <Text
                  style={[
                    styles.dayText,
                    isSelected(day) && styles.selectedDayText,
                    isToday(day) && styles.todayText,
                    isBlocked(day) && styles.blockedDayText,
                  ]}
                >
                  {day}
                </Text>
                {hasBooking(day) && <View style={styles.bookingIndicator} />}
                {isBlocked(day) && <View style={styles.blockedIndicator} />}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  emptyCell: {
    opacity: 0,
  },
  selectedDay: {
    backgroundColor: '#ff3b3b',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#ff3b3b',
  },
  bookingDay: {
    backgroundColor: '#1a4d1a',
  },
  blockedDay: {
    backgroundColor: '#4d1a1a',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  todayText: {
    color: '#ff3b3b',
    fontWeight: 'bold',
  },
  blockedDayText: {
    color: '#ff6666',
  },
  bookingIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00C851',
  },
  blockedIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff3b3b',
  },
});