import { PrismaClient, DailyData, Intervention } from '@prisma/client';
import { config } from '../../config';

const prisma = new PrismaClient();

const LOW_STRESS_THRESHOLD = config.thresholds.stress.low;
const LOW_SLEEP_THRESHOLD = config.thresholds.sleep.low;
const LOW_ACTIVITY_STEPS_THRESHOLD = config.thresholds.activity.steps.low;
const LOW_ACTIVITY_MINUTES_THRESHOLD = config.thresholds.activity.minutes.low;

/**
 * InterventionProcessor - Decides whether to send an intervention and which one
 * based on user's daily data and interaction history
 */
export class InterventionProcessor {
  public shouldSendIntervention(dailyData: DailyData): boolean {
    if (!this.hasRequiredData(dailyData)) {
      return false;
    }

    const isLowStress = this.isLowStress(dailyData);
    const isLowSleep = this.isLowSleep(dailyData);
    const isLowActivity = this.isLowActivity(dailyData);
    
    if (isLowStress) {
      if (isLowSleep) {
        if (isLowActivity) {
          return true;
        } 
        else {
          return false;
        }
      } 
      else {
        return true;
      }
    } 
    else {
      if (isLowSleep) {
        return true;
      } 
      else {
        if (isLowActivity) {
          return true;
        } 
        else {
          return false;
        }
      }
    }
  }
  
  public async getInterventionForUser(
    userId: string
  ): Promise<{ intervention: Intervention | null; interactionId?: string; message?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return { intervention: null, message: 'User not found' };
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dailyData = await prisma.dailyData.findFirst({
        where: {
          userId,
          date: {
            gte: today
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
      
      if (!dailyData) {
        return { intervention: null, message: 'No daily data available for today' };
      }
      
      if (!this.shouldSendIntervention(dailyData)) {
        return { intervention: null, message: 'No intervention needed based on current data' };
      }
      
      const pastInteractions = await prisma.userInteraction.findMany({
        where: {
          userId,
          completed: true
        },
        orderBy: {
          date: 'desc'
        },
        take: 10
      });
      
      // Check if user already has an active interaction today
      const existingInteraction = await prisma.userInteraction.findFirst({
        where: {
          userId,
          date: {
            gte: today
          },
          completed: false
        },
        include: {
          intervention: {
            include: {
              exercises: {
                where: { isActive: true },
                orderBy: { orderIndex: 'asc' },
                include: {
                  steps: {
                    where: { isActive: true },
                    orderBy: { orderIndex: 'asc' }
                  },
                  translations: {
                    where: { language: user.language }
                  }
                }
              },
              translations: {
                where: { language: user.language }
              }
            }
          }
        }
      });
      
      if (existingInteraction) {
        return { 
          intervention: existingInteraction.intervention,
          interactionId: existingInteraction.id,
          message: 'Returning existing active interaction' 
        };
      }
      
      const conditionType = this.determineInterventionCondition(dailyData);
      
      const eligibleInterventions = await prisma.intervention.findMany({
        where: {
          isActive: true,
          condition: conditionType
        },
        orderBy: {
          priority: 'desc'
        },
        include: {
          exercises: {
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
            include: {
              steps: {
                where: { isActive: true },
                orderBy: { orderIndex: 'asc' }
              },
              translations: {
                where: { language: user.language }
              }
            }
          },
          translations: {
            where: { language: user.language }
          }
        }
      });
      
      const recentInterventionIds = pastInteractions
        .filter(i => {
          // Filter interactions within the last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return i.date >= sevenDaysAgo;
        })
        .map(i => i.interventionId);
      
      let selectedIntervention = eligibleInterventions.find(
        i => !recentInterventionIds.includes(i.id)
      );
      
      // If all interventions were seen recently, just pick the highest priority one
      if (!selectedIntervention && eligibleInterventions.length > 0) {
        selectedIntervention = eligibleInterventions[0];
      }
      
      if (!selectedIntervention) {
        return { intervention: null, message: 'No appropriate intervention found' };
      }
      
      const userInteraction = await prisma.userInteraction.create({
        data: {
          userId,
          interventionId: selectedIntervention.id,
          date: new Date(),
          startedAt: new Date()
        }
      });
      
      return { 
        intervention: selectedIntervention,
        interactionId: userInteraction.id 
      };
    } catch (error) {
      console.error('Error in getInterventionForUser:', error);
      throw error;
    }
  }
  
  private hasRequiredData(dailyData: DailyData): boolean {
    return (
      dailyData.stressLevel !== null && 
      dailyData.sleepHours !== null && 
      (dailyData.activitySteps !== null || dailyData.activityMinutes !== null)
    );
  }
  
  private isLowStress(dailyData: DailyData): boolean {
    return (
      dailyData.stressLevel !== null && 
      dailyData.stressLevel < LOW_STRESS_THRESHOLD
    );
  }
  
  private isLowSleep(dailyData: DailyData): boolean {
    return (
      dailyData.sleepHours !== null && 
      dailyData.sleepHours < LOW_SLEEP_THRESHOLD
    );
  }
  
  private isLowActivity(dailyData: DailyData): boolean {
    if (dailyData.activitySteps !== null) {
      if (dailyData.activitySteps < LOW_ACTIVITY_STEPS_THRESHOLD) {
        return true;
      }
    }
    
    if (dailyData.activityMinutes !== null) {
      if (dailyData.activityMinutes < LOW_ACTIVITY_MINUTES_THRESHOLD) {
        return true;
      }
    }

    if (dailyData.activitySteps !== null && dailyData.activityMinutes !== null) {
      return (
        dailyData.activitySteps < LOW_ACTIVITY_STEPS_THRESHOLD || 
        dailyData.activityMinutes < LOW_ACTIVITY_MINUTES_THRESHOLD
      );
    }
    
    return false;
  }
  

  private determineInterventionCondition(dailyData: DailyData): string {
    const isLowStress = this.isLowStress(dailyData);
    const isLowSleep = this.isLowSleep(dailyData);
    const isLowActivity = this.isLowActivity(dailyData);
    
    let condition = '';
    
    if (isLowStress) {
      condition += 'low_stress_';
    } else {
      condition += 'high_stress_';
    }
    
    if (isLowSleep) {
      condition += 'low_sleep_';
    } else {
      condition += 'high_sleep_';
    }
    
    if (isLowActivity) {
      condition += 'low_activity';
    } else {
      condition += 'high_activity';
    }
    
    return condition;
  }
}
