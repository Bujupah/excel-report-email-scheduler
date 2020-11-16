import React, { FC, useState } from 'react';
import classNames from 'classnames';
import intl from 'react-intl-universal';
import { css } from 'emotion';
import { Checkbox, Icon, Input, Legend, Spinner, Tooltip } from '@grafana/ui';
import { useQuery } from 'react-query';
import { getUsers, getGroupMembers, deleteReportGroupMembership, createReportGroupMembership } from 'api';
import { CreateGroupMemberVars, ReportGroupMember, User } from 'common/types';
import { ReportGroup } from '../Schedules/ReportSchedulesTab';
import { useOptimisticMutation } from 'hooks/useOptimisticMutation';

type Props = {
  reportGroup: ReportGroup | null;
  datasourceID: number;
};

const listStyle = classNames({
  'card-section': true,
  'card-list-layout-grid': true,
  'card-list-layout-list': true,
  'card-list': true,
});

const marginForCheckbox = css`
  margin-right: 10px;
`;

export const ReportGroupMemberList: FC<Props> = ({ reportGroup, datasourceID }) => {
  const { id: reportGroupID } = reportGroup ?? {};

  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: users } = useQuery<User[]>('users', () => getUsers(datasourceID));
  const { data: groupMembers } = useQuery<ReportGroupMember[]>(['groupMembers', reportGroupID], getGroupMembers);

  const [createMembership] = useOptimisticMutation<
    ReportGroupMember[],
    ReportGroupMember,
    CreateGroupMemberVars,
    ReportGroupMember[]
  >(
    ['groupMembers', reportGroupID],
    createReportGroupMembership,
    variables => ({ ...variables, userID: variables.user.id, id: '' }),
    (prevState, optimisticValue) => {
      if (prevState) {
        return [...prevState, optimisticValue];
      } else {
        return prevState;
      }
    },
    []
  );

  const [deleteMembership] = useOptimisticMutation<
    ReportGroupMember[],
    ReportGroupMember,
    ReportGroupMember,
    ReportGroupMember[]
  >(
    ['groupMembers', reportGroupID],
    deleteReportGroupMembership,
    groupMember => groupMember,
    (prevState, optimisticValue) => {
      if (prevState) {
        return prevState.filter(member => member.id !== optimisticValue.id);
      } else {
        return prevState;
      }
    },
    []
  );

  const onToggleMember = (user: User) => {
    const { id: userID } = user;
    const exists = groupMembers?.find((reportMember: ReportGroupMember) => reportMember.userID === userID);

    if (exists) {
      deleteMembership(exists);
    } else {
      createMembership({ user, reportGroupID: reportGroupID ?? '' });
    }
  };

  return (
    <div style={{}}>
      <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center' }}>
        <Tooltip placement="top" content={intl.get('users_tooltip')} theme={'info'}>
          <Icon
            name="info-circle"
            size="sm"
            style={{ marginLeft: '10px', marginRight: '10px', marginBottom: '16px' }}
          />
        </Tooltip>
        <Legend>{intl.get('users')}</Legend>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
        <Icon style={{ marginRight: '10px' }} name="search" />
        <Input
          css=""
          placeholder="Search for users"
          onChange={e => {
            const { value } = e.target as HTMLInputElement;
            return setSearchTerm(value);
          }}
        />
        <Icon style={{ marginRight: '10px' }} size={'xl'} name="trash-alt" onClick={() => setSearchTerm('')} />
      </div>
      <ol className={listStyle} style={{ maxHeight: '300px', overflow: 'scroll' }}>
        {users ? (
          users
            ?.filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((user: User) => {
              const { name, e_mail, id } = user;
              const isChecked = groupMembers?.find((groupMember: ReportGroupMember) => groupMember.userID === id);
              return (
                <li className="card-item-wrapper" style={e_mail ? { cursor: 'pointer' } : {}}>
                  <div className={'card-item'} onClick={() => e_mail && onToggleMember(user)}>
                    <div className="card-item-body">
                      <div className={marginForCheckbox}>
                        <Checkbox value={!!isChecked} css="" />
                      </div>

                      <div className="card-item-details">
                        <div className="card-item-name">{name}</div>
                        <div className="card-item-type">{e_mail ? e_mail : intl.get('no_email')}</div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
        ) : (
          <Spinner style={{ flex: 1, display: 'flex', justifyContent: 'center' }} />
        )}
      </ol>
    </div>
  );
};
